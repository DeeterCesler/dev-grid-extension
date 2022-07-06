document.addEventListener(
  'DOMContentLoaded',
  function () {
    const checkPageButton = document.getElementById('toggle')
    checkPageButton.addEventListener(
      'click',
      function () {
        // toggle class of hidden grid?
        alert(':0')
        const grid = document.getElementById('big-grid')
        const isShowing = grid.classList.contains('show')
        if (isShowing) {
          grid.setAttribute('class', 'hide')
          alert(':1')
        } else {
          grid.setAttribute('class', 'show')
          alert(':2')
        }
      },
      false,
    )
  },
  false,
)
