class Node {
  constructor(name, parent, data) {
    this.name = name
    this.parent = parent
    this.data = data
    if(parent.path) {
      this.path = parent.path.concat(name)
    } else {
      this.path = [name]
    }
    this.renderedChildren = false
    this.createChildren()
  }

  render(opened = false) {
    var root = this.parent.container
    var level = parseInt(root.getAttribute('level')) + 1
    var rootId = root.hasAttribute('id') ? `${root.getAttribute('id')}_` : ''
    var id = `${rootId}${(id ? id : this.name.replaceAll('.', '_'))}`;

    var header = document.createElement('div')
    header.classList.add('tree-view-header')
    header.setAttribute('for', id)
    var title = document.createElement('div')
    title.classList.add('tree-view-title')
    title.textContent = `${this.name} `

    header.append(title)
    root.append(header)

    var body = document.createElement('div')
    body.classList.add('tree-view-body')
    if(opened) {
      header.classList.add('active')
      body.classList.add('active')
    }
    body.setAttribute('id', id)
    body.dataset.path = this.path.join('/')
    body.setAttribute('level', level)
    body.style.marginLeft = `${level * 10}px`
    root.append(body);

    this.container = body
    this.header = header
  }

  // This adds a link to the ruby/spec github repository.
  // This could be not 100% correct, considering that new commits may have been added to
  // master already. If we want to make this accurate, we have to transmit the commit sha
  // of the commit that we ran the specs with.
  addSpecLinkToHeader(linkPath) {
    var title = this.header.querySelector('.tree-view-title')
    var linkContainer = document.createElement('a')
    linkContainer.href = `https://www.github.com/ruby/spec/tree/master/${linkPath}`
    linkContainer.target = '_blank'
    linkContainer.rel = 'noopener noreferrer'
    linkContainer.textContent = '🡕'
    title.innerHTML += ' '
    title.append(linkContainer)
  }

  // Create an element that portraits a specific spec stat (like successful examples).
  createStatsCounter(type, count) {
    var counterContainer = document.createElement('div')
    counterContainer.classList.add('stats-counter', type)
    var counter = document.createElement('div')
    counter.textContent = count
    counterContainer.prepend(counter)
    return counterContainer
  }

  // Call #render for all children.
  renderChildren(opened = false) {
    if(this.renderedChildren) {
      console.warn('Tried to render children while all children were already rendered.')
      return
    }

    this.children.forEach(child => {
      child.render(opened);
    })
    this.renderedChildren = true
  }

  findChildNode(name) {
    return this.children.find(child => child.name === name)
  }

  // Openes a node. If the children were not rendered already, they get rendered.
  open() {
    if(!this.renderedChildren) {
      this.renderChildren()
    }
    this.header.classList.add('active')
    this.container.classList.add('active')
  }

  // This closes this node and all inner nodes.
  close() {
    if(this.header)
      this.header.classList.remove('active')
    this.container.classList.remove('active')
    if(this.renderedChildren)
      this.children.forEach(child => child.close())
  }
}
