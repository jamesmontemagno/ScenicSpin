Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outputPath = Join-Path $root 'assets\og-image.png'

$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen($hex, $size) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($hex), $size)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function Fill-RoundedRectangle($g, $brush, $x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $path.Dispose()
}

$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point 0, 0),
  (New-Object System.Drawing.Point $width, $height),
  ([System.Drawing.ColorTranslator]::FromHtml('#051117')),
  ([System.Drawing.ColorTranslator]::FromHtml('#12333a'))
)
$graphics.FillRectangle($background, 0, 0, $width, $height)
$graphics.FillEllipse((New-Brush '#123f4a'), -180, -160, 620, 520)
$graphics.FillEllipse((New-Brush '#0b2c2f'), 520, 300, 760, 520)

$wavePens = @(
  (New-Pen '#36e7aa' 2),
  (New-Pen '#65d7ff' 2),
  (New-Pen '#ffbd66' 2)
)
for ($line = 0; $line -lt 3; $line++) {
  $points = New-Object 'System.Drawing.PointF[]' 37
  for ($i = 0; $i -lt 37; $i++) {
    $x = -40 + ($i * 36)
    $y = 146 + ($line * 12) + [Math]::Sin(($i + $line) * 0.7) * 20
    $points[$i] = New-Object System.Drawing.PointF $x, $y
  }
  $graphics.DrawCurve($wavePens[$line], $points)
}
for ($line = 0; $line -lt 3; $line++) {
  $points = New-Object 'System.Drawing.PointF[]' 37
  for ($i = 0; $i -lt 37; $i++) {
    $x = -40 + ($i * 36)
    $y = 538 + ($line * 15) + [Math]::Sin(($i + $line) * 0.85) * 24
    $points[$i] = New-Object System.Drawing.PointF $x, $y
  }
  $graphics.DrawCurve($wavePens[$line], $points)
}

$tealBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point 640, 60),
  (New-Object System.Drawing.Point 1100, 520),
  ([System.Drawing.ColorTranslator]::FromHtml('#1d7da8')),
  ([System.Drawing.ColorTranslator]::FromHtml('#37e1a4'))
)
Fill-RoundedRectangle $graphics $tealBrush 640 58 462 470 36
$graphics.FillRectangle((New-Brush '#071419'), 640, 322, 462, 206)

$mountainBrush = New-Brush '#061218'
$peak1 = @(
  (New-Object System.Drawing.Point 690, 360),
  (New-Object System.Drawing.Point 800, 184),
  (New-Object System.Drawing.Point 900, 360)
)
$peak2 = @(
  (New-Object System.Drawing.Point 806, 360),
  (New-Object System.Drawing.Point 940, 150),
  (New-Object System.Drawing.Point 1086, 360)
)
$graphics.FillPolygon($mountainBrush, $peak1)
$graphics.FillPolygon($mountainBrush, $peak2)
$graphics.FillPolygon((New-Brush '#eef9fc'), @(
  (New-Object System.Drawing.Point 912, 306),
  (New-Object System.Drawing.Point 1022, 230),
  (New-Object System.Drawing.Point 1086, 360),
  (New-Object System.Drawing.Point 986, 322)
))
$graphics.FillEllipse((New-Brush '#ffbd66'), 970, 96, 88, 88)

$roadPen1 = New-Pen '#37e1a4' 18
$roadPen2 = New-Pen '#65d7ff' 12
$graphics.DrawCurve($roadPen1, @(
  (New-Object System.Drawing.Point 720, 414),
  (New-Object System.Drawing.Point 838, 376),
  (New-Object System.Drawing.Point 960, 356),
  (New-Object System.Drawing.Point 1094, 278)
))
$graphics.DrawCurve($roadPen2, @(
  (New-Object System.Drawing.Point 714, 438),
  (New-Object System.Drawing.Point 836, 406),
  (New-Object System.Drawing.Point 968, 382),
  (New-Object System.Drawing.Point 1094, 318)
))
$graphics.FillEllipse((New-Brush '#ffbd66'), 884, 340, 32, 32)

$blackBrush = New-Brush '#061218'
Fill-RoundedRectangle $graphics $blackBrush 672 378 430 150 30
Fill-RoundedRectangle $graphics (New-Brush '#37e1a4') 806 452 230 44 22

$fontFamily = 'Segoe UI'
$brandFont = New-Object System.Drawing.Font $fontFamily, 62, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$eyebrowFont = New-Object System.Drawing.Font $fontFamily, 27, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$headlineFont = New-Object System.Drawing.Font $fontFamily, 52, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$urlFont = New-Object System.Drawing.Font $fontFamily, 26, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)

Fill-RoundedRectangle $graphics (New-Brush '#37e1a4') 80 76 76 76 20
$arrowPen = New-Pen '#061218' 8
$graphics.DrawLine($arrowPen, 104, 126, 132, 98)
$graphics.DrawLine($arrowPen, 116, 98, 132, 98)
$graphics.DrawLine($arrowPen, 132, 98, 132, 114)

$graphics.DrawString('PedalScape', $brandFont, (New-Brush '#eaf6fb'), 178, 92)
$graphics.DrawString('Indoor bike + scenic escape', $eyebrowFont, (New-Brush '#39f0b2'), 82, 198)
$headlineLines = @('Any bike.', 'Any screen.', 'Beautiful rides', 'from home.')
for ($i = 0; $i -lt $headlineLines.Count; $i++) {
  $graphics.DrawString($headlineLines[$i], $headlineFont, (New-Brush '#eaf6fb'), 88, (286 + ($i * 57)))
}
Fill-RoundedRectangle $graphics (New-Brush '#37e1a4') 80 548 278 46 23
$graphics.DrawString('pedalscape.com', $urlFont, (New-Brush '#061218'), 112, 556)
$graphics.DrawString('pedalscape.com', $urlFont, (New-Brush '#061218'), 832, 460)

$graphics.Dispose()
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
