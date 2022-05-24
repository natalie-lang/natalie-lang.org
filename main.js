anychart.onDocumentReady(() => {
  fetch('/stats/stats.json')
    .then((res) => res.json())
    .then((data) => {
      data.reverse()
      const dataInGrid = data.map((run) => {
        return [
          run.date.split('T')[0],
          run.stats['Successful Examples'],
          run.stats['Failed Examples'],
          run.stats['Errored Examples'],
        ]
      })
      const dataSet = anychart.data.set(dataInGrid)
      const successData = dataSet.mapAs({ x: 0, value: 1 })
      const failData = dataSet.mapAs({ x: 0, value: 2 })
      const errorData = dataSet.mapAs({ x: 0, value: 3 })
      const chart = anychart.line()
      chart.animation(true)
      chart.title('ruby/spec results over time')
      chart.yAxis().title('test count')
      chart.crosshair().enabled(true).yLabel(false).yStroke(null)
      const successSeries = chart.line(successData)
      successSeries
        .name('Successful Tests')
        .stroke('3 #a8d964')
        .tooltip()
        .format('Successful Tests: {%value}')
      const failSeries = chart.line(failData)
      failSeries
        .name('Failed Tests')
        .stroke('3 #e5ca28')
        .tooltip()
        .format('Failed Tests: {%value}')
      const errorSeries = chart.line(errorData)
      errorSeries
        .name('Errored Tests')
        .stroke('3 #d04444')
        .tooltip()
        .format('Errored Tests: {%value}')
      chart.legend().enabled(true)
      chart.container('chart')
      chart.draw()

      return data.reverse()
    })
    .then((tests) => tests[0].stats)
    .then((latest) => {
      document.getElementById('successful-tests-counter').innerText =
        latest['Successful Examples']
      document.getElementById('failing-tests-counter').innerText =
        latest['Failed Examples']
      document.getElementById('erroring-tests-counter').innerText =
        latest['Errored Examples']
      document.getElementById('not-compiling-tests-counter').innerText =
        latest['Compile Errors']
      document.getElementById('crashing-tests-counter').innerText =
        latest['Crashes']
      document.getElementById('timeout-tests-counter').innerText =
        latest['Timeouts']
    })
    .catch((error) => {
      console.log(error)
      document.getElementById('is-natalie-ruby-yet-stats-panel').style =
        'display: none;'
    })
})
