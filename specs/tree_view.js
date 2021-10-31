class TreeView {
  constructor(container) {
    this.container = container
  }

  // Creates a root node if the data has a spec key.
  setData(data) {
    this.data = data
    if(data.spec) {
      this.rootNode = new DirectoryNode('spec', this, data.spec)
    } else {
      this.rootNode = null
    }
  }

  // Clear the container and render in the spec results.
  render(opened = false) {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.lastChild);
    }

    if(this.rootNode) {
      this.rootNode.render(opened)
    } else {
      var noResults = document.createElement('p')
      noResults.textContent = 'No results found.'
      this.container.append(noResults)
      return
    }
  }

  rerender(data, opened = false) {
    this.setData(data)
    this.render(opened)
  }

  // If a root node exists we open it recursively.
  openRecursively() {
    if(this.rootNode)
      this.rootNode.openRecursively()
  }

  // Get a node by its path. This performs a recursive search in all child nodes.
  // One can retrieve the path from the data attributes of each tree view body.
  getNodeByPath(path) {
    var currentNode = this.rootNode
    path.slice(1).forEach(part => {
      if(currentNode instanceof FileNode) {
        currentNode = currentNode.findChildNode(part) || currentNode
      } else {
        currentNode = currentNode.findChildNode(part)
      }
    })
    return currentNode
  }
}
