var grid = document.createElement('div')
grid.setAttribute('id', 'big-grid')
grid.setAttribute('class', 'hide')
document.body.appendChild(grid)

var colLeft = document.createElement('div')
var colRight = document.createElement('div')
var rowTop = document.createElement('div')
var rowBottom = document.createElement('div')

colLeft.setAttribute('class', 'dev-col-left')
colRight.setAttribute('class', 'dev-col-right')
rowTop.setAttribute('class', 'dev-row-top')
rowBottom.setAttribute('class', 'dev-row-bottom')

grid.appendChild(colLeft)
grid.appendChild(colRight)
grid.appendChild(rowTop)
grid.appendChild(rowBottom)
