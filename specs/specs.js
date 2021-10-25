var specResults = {}
var tree_view = null;

document.addEventListener('DOMContentLoaded', () => {
  tree_view = new TreeView(document.querySelector('.tree-view-root'))

  fetch('/specs/current.json')
    .then(res => res.json())
    .then(data => {
      specResults = data.stats

      renderDate(data.date)

      // If a search query was passed we execute the search instead of displaying
      // all spec results.
      if(window.location.search.length !== 0) {
        var params = new URLSearchParams(window.location.search)
        if(params.has('q')) {
          var query = params.get('q')
          if(query.length > 0) {
            document.querySelector('#search').value = query
            search(query);
            return;
          }
        }
      }

      tree_view.rerender(specResults, true)
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
  document.getElementById('search').addEventListener('input', (e) => {
    if(searchTimeout) {
      clearTimeout(searchTimeout)
    }

    var target = e.currentTarget;
    searchTimeout = setTimeout(() => {
      search(target.value)
    }, 1000)
  })
});

// Perform a search on the query. If the query is empty all spec results will be rerendered.
function search(query) {
  query = query.trim().toLowerCase()
  var basePath = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  if(query.length == 0) {
    window.history.pushState(null, null, basePath)
    tree_view.rerender(specResults, true)
    return
  }

  var urlParams = new URLSearchParams()
  urlParams.set('q', query);
  window.history.pushState(null, null, `${basePath}?${urlParams.toString()}`)
  var copy = JSON.parse(JSON.stringify(specResults))

  searchObject(query, copy)
  tree_view.rerender(copy)
  tree_view.openRecursively()
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

// Render the time the specs ran last into the introduction paragraph.
function renderDate(date) {
  var dateContainer = document.querySelector('#spec-date')
  dateContainer.textContent = new Date(date).toUTCString()
  dateContainer.parentElement.style = null
}
