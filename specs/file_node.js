class FileNode extends Node {
  createChildren() {
    this.children = []

    for(var [i, message] of this.data.error_messages.entries()) {
      this.children.push(new ErrorMessageNode(`error_${i}`, this, message))
    }
  }

  render() {
    super.render()

    this.addSpecLinkToHeader(this.path.slice(1).join('/'))
    var statsContainer = document.createElement('div')
    statsContainer.classList.add('tree-view-stats')
    if(!this.data.compiled) {
      statsContainer.style.fontWeight = 'bold'
      statsContainer.textContent = 'Compilation Error'
    } else
    if(this.data.timeouted) {
      statsContainer.style.fontWeight = 'bold'
      statsContainer.style.color = '#888888'
      statsContainer.textContent = 'Timed Out'
    } else
    if(this.data.crashed) {
      statsContainer.style.fontWeight = 'bold'
      statsContainer.style.color = '#830a46'
      statsContainer.textContent = 'Crashed'
    } else {
      ['success', 'failures', 'errors'].forEach(type => {
        var counter = this.createStatsCounter(type, this.data[type])
        statsContainer.append(counter);
      })

      var progressBar = document.createElement('div')
      var total = this.data.success + this.data.errors + this.data.failures
      progressBar.classList.add('progress-bar');
      ['success', 'failures', 'errors'].forEach(type => {
        var part = document.createElement('div')
        part.classList.add(`progress-bar-${type}`)
        part.style.width = (this.data[type] / total * 100) + '%'
        progressBar.append(part)
      })
      statsContainer.append(progressBar)
    }

    this.header.append(statsContainer);
    if(this.data.error_messages.length === 0) {
      this.header.removeAttribute('for')
      this.container.remove()
    }
  }
}
