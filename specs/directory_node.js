class DirectoryNode extends Node {
  createChildren() {
    this.children = []
    Object.entries(this.data).forEach(([key, value]) => {
      if(value.compiled !== undefined) {
        this.children.push(new FileNode(key, this, value))
      } else {
        this.children.push(new DirectoryNode(key, this, value))
      }
    })
  }

  render(opened = false) {
    super.render(opened)
    this.addSpecLinkToHeader(this.path.slice(1).join('/'))

    if(opened) {
      this.renderChildren()
    }

    var statsContainer = document.createElement('div')
    statsContainer.classList.add('tree-view-stats');
    statsContainer.style.marginRight = '200px';
    ['compiled', 'crashed', 'timeouted', 'success', 'failures', 'errors'].forEach(type => {
      var counterContainer = this.createStatsCounter(type, this.getChildrenStatsCount(type))
      statsContainer.append(counterContainer)
    })
    this.header.append(statsContainer);
  }

  // Adding up the stats of one type for each spec file in this directory.
  getChildrenStatsCount(type) {
    var count = 0;
    this.children.forEach(child => {
      if(child instanceof FileNode) {
        // When 'compiled' is specified we actually want the number of compilation errors.
        if(type !== 'compiled') {
          count += child.data[type]
        } else {
          count += !child.data[type]
        }
      } else {
        count += child.getChildrenStatsCount(type)
      }
    })
    return count
  }

  // Open this node if needed and also open all children recursively.
  openRecursively() {
    if(!this.container.classList.contains('active')) {
      this.open()
    }

    this.children.forEach(child => {
      if(child instanceof FileNode) return
      child.openRecursively()
    })
  }
}
