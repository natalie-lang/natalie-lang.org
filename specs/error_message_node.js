class ErrorMessageNode extends Node {
  // An error message node has no children.
  createChildren() {
    this.children = []
  }

  render() {
    super.render()

    var messageParts = this.data.split('\n')
    var spec = messageParts[0]
    var backtrace = messageParts[messageParts.length - 1]
    var error = messageParts.slice(1, messageParts.length - 1).join('\n');

    this.header.querySelector('.tree-view-title').textContent = `${spec} `
    var errorMessageContainer = document.createElement('pre')
    errorMessageContainer.classList.add('error-message')
    errorMessageContainer.textContent = error.replaceAll('\n', '\\n')
    errorMessageContainer.textContent += '\n\n'
    try {
      backtrace = JSON.parse(backtrace)
      backtrace = backtrace.map(line => line.replace('/home/runner/work/natalie/', ''))

      for(var line of backtrace) {
        if(line.startsWith('natalie/spec') || line.startsWith('spec')) {
          var [path, lineNumber] = line.split(':')
          if(path && lineNumber) {
            path = path.split('/')
            if(path[0] == 'natalie') path.shift()

            this.addSpecLinkToHeader(`${path.slice(1).join('/')}#L${lineNumber}`);
            break
          }
        }
      }

      errorMessageContainer.textContent += backtrace.join('\n')
    } catch(e) {
      console.log(`failed to parse ${backtrace} (spec: ${spec})\n${e}`)
    }
    this.container.append(errorMessageContainer)
  }
}
