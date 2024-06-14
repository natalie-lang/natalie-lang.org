fetch("/stats/stats.json")
  .then((res) => res.json())
  .then((data) => {
    data.reverse()

    const successTrace = {
      name: "Successful Specs",
      x: [],
      y: [],
      type: "scatter",
      connectgaps: true,
      line: { color: "green" },
    }
    const failTrace = {
      name: "Failed Specs",
      x: [],
      y: [],
      type: "scatter",
      connectgaps: true,
      line: { color: "yellow" },
    }
    const errorTrace = {
      name: "Errored Specs",
      x: [],
      y: [],
      type: "scatter",
      connectgaps: true,
      line: { color: "red" },
    }

    data.forEach((run) => {
      const date = run.date.split("T")[0]
      successTrace.x.push(date)
      successTrace.y.push(run.stats["Successful Examples"])
      failTrace.x.push(date)
      failTrace.y.push(run.stats["Failed Examples"])
      errorTrace.x.push(date)
      errorTrace.y.push(run.stats["Errored Examples"])
    })

    const layout = {
      title: "ruby/spec results over time",
    }

    Plotly.newPlot("chart", [successTrace, failTrace, errorTrace], layout)

    return data.reverse()
  })
  .then((tests) => tests[0].stats)
  .then((latest) => {
    document.getElementById("successful-tests-counter").innerText =
      latest["Successful Examples"]
    document.getElementById("failing-tests-counter").innerText =
      latest["Failed Examples"]
    document.getElementById("erroring-tests-counter").innerText =
      latest["Errored Examples"]
    document.getElementById("not-compiling-tests-counter").innerText =
      latest["Compile Errors"]
    document.getElementById("crashing-tests-counter").innerText =
      latest["Crashes"]
    document.getElementById("timeout-tests-counter").innerText =
      latest["Timeouts"]
  })
  .catch((error) => {
    console.log(error)
    document.getElementById("is-natalie-ruby-yet-stats-panel").style =
      "display: none;"
  })
