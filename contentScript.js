var grid = document.createElement('div')
grid.setAttribute('class', 'big-grid')
document.body.appendChild(grid)

var colLeft = document.createElement('div')
var colRight = document.createElement('div')
var rowTop = document.createElement('div')
var rowBottom = document.createElement('div')

colLeft.setAttribute('class', 'col-left')
colRight.setAttribute('class', 'col-right')
rowTop.setAttribute('class', 'row-top')
rowBottom.setAttribute('class', 'row-bottom')

grid.appendChild(colLeft)
grid.appendChild(colRight)
grid.appendChild(rowTop)
grid.appendChild(rowBottom)
