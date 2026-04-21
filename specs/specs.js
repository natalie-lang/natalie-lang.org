var specResults = {}
var tree_view = null;

document.addEventListener('DOMContentLoaded', () => {
  tree_view = new TreeView(document.querySelector('.tree-view-root'))

  fetch('/stats/current.json')
    .then(res => res.json())
    .then(data => {
      specResults = data.stats

      renderDate(data.date)

      // Restore filter state from URL params on initial load.
      if(window.location.search.length !== 0) {
        var params = new URLSearchParams(window.location.search)
        if(params.has('q')) {
          document.getElementById('search').value = params.get('q')
        }
        if(params.get('hide_passing') === '1') {
          document.getElementById('hide-passing').checked = true
        }
        if(params.get('sort_failures') === '1') {
          document.getElementById('sort-failures').checked = true
        }
        if(params.get('hide_unactionable') === '1') {
          document.getElementById('hide-unactionable').checked = true
        }
      }

      applyHidePassing()
      applySortByFailures()
      applyHideUnactionable()
      applySearch()
    })
    .catch(error => {
      console.log(error)
    })

  // If clicked on a tree node
  document.querySelector('.tree-view-root').addEventListener('click', (e) => {
    if(e.target.tagName === 'A') return;

    var header = e.target.closest('.tree-view-header')
    if(header && header.hasAttribute('for')) {
      var target = header.getAttribute('for')
      var element = header.parentElement.querySelector(`#${target}`)
      if(element) {
        var path = element.dataset.path.split('/')
        var node = tree_view.getNodeByPath(path)
        if(element.classList.contains('active')) {
          node.close()
        } else {
          node.open()
        }
      }
    }
  })

  // On writing to the search input. This will be delayed by 1s to prevent
  // continous re-searching.
  var searchTimeout = null
  document.getElementById('search').addEventListener('input', () => {
    if(searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(applySearch, 1000)
  })

  document.getElementById('hide-passing').addEventListener('change', applyHidePassing)
  document.getElementById('sort-failures').addEventListener('change', applySortByFailures)
  document.getElementById('hide-unactionable').addEventListener('change', applyHideUnactionable)
});

function updateUrl() {
  var query = document.getElementById('search').value.trim().toLowerCase()
  var hidePassing = document.getElementById('hide-passing').checked
  var sortFailures = document.getElementById('sort-failures').checked
  var hideUnactionable = document.getElementById('hide-unactionable').checked
  var basePath = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
  var urlParams = new URLSearchParams()
  if(query.length > 0) urlParams.set('q', query)
  if(hidePassing) urlParams.set('hide_passing', '1')
  if(sortFailures) urlParams.set('sort_failures', '1')
  if(hideUnactionable) urlParams.set('hide_unactionable', '1')
  var queryString = urlParams.toString()
  window.history.pushState(null, null, queryString.length > 0 ? `${basePath}?${queryString}` : basePath)
}

function applySearch() {
  var query = document.getElementById('search').value.trim().toLowerCase()
  updateUrl()

  if(query.length === 0) {
    tree_view.rerender(specResults, true)
    return
  }

  var copy = JSON.parse(JSON.stringify(specResults))
  searchObject(query, copy)
  tree_view.rerender(copy)
  tree_view.openRecursively()
}

function applyHidePassing() {
  document.body.classList.toggle('hide-passing', document.getElementById('hide-passing').checked)
  updateUrl()
}

function applySortByFailures() {
  document.body.classList.toggle('sort-by-failures', document.getElementById('sort-failures').checked)
  updateUrl()
}

function applyHideUnactionable() {
  document.body.classList.toggle('hide-unactionable', document.getElementById('hide-unactionable').checked)
  updateUrl()
}

function isUnactionableMessage(msg) {
  return msg.indexOf('raise_comptime_value_error') !== -1 ||
    msg.indexOf('eval() only works on static strings') !== -1
}

function isFileAllUnactionable(fileData) {
  if(isPassing(fileData)) return false
  if(fileData.crashed || fileData.timeouted) return false
  var msgs = fileData.error_messages || []
  if(msgs.length === 0) return false
  return msgs.every(isUnactionableMessage)
}

function dataIsAllUnactionableOrPassing(data) {
  if(data.compiled !== undefined) {
    return isPassing(data) || isFileAllUnactionable(data)
  }
  var values = Object.values(data)
  return values.length > 0 && values.every(dataIsAllUnactionableOrPassing)
}

function dataIsAllUnactionable(data) {
  if(data.compiled !== undefined) {
    return isFileAllUnactionable(data)
  }
  var values = Object.values(data)
  if(values.length === 0) return false
  return values.every(dataIsAllUnactionable)
}

// Searches through a javascript object using the #matches method to to check whether
// a key is found by query. This search operation is running recursively => depth-first search
function searchObject(query, object, path = []) {
  var regex = new RegExp(query);
  Object.entries(object).forEach(([key, value]) => {
    var newPath = path.concat(key)
    if(value.compiled === undefined) {
      // In this case value is a spec directory. We run the search recursively in this
      // directory until a directory or spec file name matches the query.
      // If the search in the directory returned an empty object and the directory itself
      // does not match we remove it from object.
      if(!matches(regex, key, newPath)) {
        searchObject(query, value, newPath)
        if(Object.keys(value).length == 0) {
          delete object[key]
        }
      }
    } else
    if(!matches(regex, key, newPath)) {
      // Remove the spec file if it's name does not match the query
      delete object[key]
    }
  })
}

// Matching function for a query against a directory/file name and it's path.
// Example: We are matching for key = "push_spec.rb", path = ["core", "array", "push_spec.rb"]
//    query: core => matches
//    query: push_spec => matches
//    query: Array#push => matches
//    query: array/core/push => matches
//    query: coarr => does not match
//    query: co/arr => does not match
function matches(regex, key, path) {
  return key.match(regex) ||
    path.join('').match(regex) ||
    path.join(' ').match(regex) ||
    path.join('/').match(regex) ||
    path.join('#').match(regex)
}

function isPassing(fileData) {
  return fileData.compiled &&
    !fileData.crashed &&
    !fileData.timeouted &&
    fileData.failures === 0 &&
    fileData.errors === 0
}

function dataIsAllPassing(data) {
  if(data.compiled !== undefined) {
    return isPassing(data)
  }
  var values = Object.values(data)
  return values.length > 0 && values.every(dataIsAllPassing)
}

// Render the time the specs ran last into the introduction paragraph.
function renderDate(date) {
  var dateContainer = document.querySelector('#spec-date')
  dateContainer.textContent = new Date(date).toUTCString()
  dateContainer.parentElement.style = null
}
