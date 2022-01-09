

function log(text)
{
  if(!DEVELOPMENT) return;
  console.log(text);
}

function error(text)
{
  console.error(text);
}


function distance(x1, x2, y1, y2)
{
  var a = x1 - x2;
  var b = y1 - y2;

  return Math.sqrt(a*a + b*b);
}
