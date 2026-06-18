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

# Draws text optically centered inside a pill/chiclet rectangle. GDI+ DrawString
# placed at a raw point ignores font ascent/descent, which pushes glyphs low and
# leaves the descenders touching the bottom edge. Measuring the real glyph ink
# box (via a GraphicsPath) and centering that box keeps the label balanced
# regardless of the font's internal leading or descender reservations.
function Draw-CenteredText($g, $text, $font, $brush, $x, $y, $w, $h) {
  $fmt = [System.Drawing.StringFormat]::GenericTypographic.Clone()
  $fmt.FormatFlags = $fmt.FormatFlags -bor [System.Drawing.StringFormatFlags]::NoWrap
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $origin = New-Object System.Drawing.PointF 0, 0
  $path.AddString($text, $font.FontFamily, [int]$font.Style, $font.Size, $origin, $fmt)
  $bounds = $path.GetBounds()
  $path.Dispose()
  $textX = $x + ($w - $bounds.Width) / 2 - $bounds.X
  $textY = $y + ($h - $bounds.Height) / 2 - $bounds.Y
  $g.DrawString($text, $font, $brush, $textX, $textY, $fmt)
  $fmt.Dispose()
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

# Brand mark: render the site favicon artwork (a bike climbing a scenic road)
# instead of a hand-drawn arrow so the OG preview matches the app icon. The
# coordinates mirror icons/favicon.svg (64x64 viewBox) scaled into the 76px badge
# at (80, 76); the badge uses the app-icon gradient fill so the mark stays legible
# against the dark background.
$iconX = 80
$iconY = 76
$iconSize = 76
$iconScale = $iconSize / 64

function Get-IconPoint($px, $py) {
  $ix = $iconX + $px * $iconScale
  $iy = $iconY + $py * $iconScale
  return New-Object System.Drawing.PointF $ix, $iy
}

function New-IconPen($hex, $strokeWidth) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($hex), [single]($strokeWidth * $iconScale))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

$iconBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point $iconX, $iconY),
  (New-Object System.Drawing.Point ($iconX + $iconSize), ($iconY + $iconSize)),
  ([System.Drawing.ColorTranslator]::FromHtml('#14333d')),
  ([System.Drawing.ColorTranslator]::FromHtml('#061318'))
)
Fill-RoundedRectangle $graphics $iconBackground $iconX $iconY $iconSize $iconSize ([int](16 * $iconScale))

$iconRoad = New-Object System.Drawing.Drawing2D.GraphicsPath
$iconRoad.AddBezier((Get-IconPoint 12 42), (Get-IconPoint 22 28), (Get-IconPoint 28 24), (Get-IconPoint 35 28))
$iconRoad.AddBezier((Get-IconPoint 35 28), (Get-IconPoint 41 31), (Get-IconPoint 44 29), (Get-IconPoint 52 18))
$graphics.DrawPath((New-IconPen '#38e8a4' 6), $iconRoad)
$iconRoad.Dispose()

$iconWheelPen = New-IconPen '#68d8ff' 4
$iconWheelSize = [single](14 * $iconScale)
$iconLeftWheel = Get-IconPoint 13 37
$iconRightWheel = Get-IconPoint 39 37
$graphics.DrawEllipse($iconWheelPen, $iconLeftWheel.X, $iconLeftWheel.Y, $iconWheelSize, $iconWheelSize)
$graphics.DrawEllipse($iconWheelPen, $iconRightWheel.X, $iconRightWheel.Y, $iconWheelSize, $iconWheelSize)

$iconFrame = New-Object System.Drawing.Drawing2D.GraphicsPath
$iconFrame.AddLine((Get-IconPoint 29 44), (Get-IconPoint 36 44))
$iconFrame.AddLine((Get-IconPoint 36 44), (Get-IconPoint 31 32))
$graphics.DrawPath((New-IconPen '#ffb86b' 4), $iconFrame)
$iconFrame.Dispose()

$graphics.DrawString('PedalScape', $brandFont, (New-Brush '#eaf6fb'), 178, 92)
$graphics.DrawString('Indoor bike + scenic escape', $eyebrowFont, (New-Brush '#39f0b2'), 82, 198)
$headlineLines = @('Any bike.', 'Any screen.', 'Beautiful rides', 'from home.')
for ($i = 0; $i -lt $headlineLines.Count; $i++) {
  $graphics.DrawString($headlineLines[$i], $headlineFont, (New-Brush '#eaf6fb'), 88, (286 + ($i * 57)))
}
Fill-RoundedRectangle $graphics (New-Brush '#37e1a4') 80 548 278 46 23
Draw-CenteredText $graphics 'pedalscape.com' $urlFont (New-Brush '#061218') 80 548 278 46
Draw-CenteredText $graphics 'pedalscape.com' $urlFont (New-Brush '#061218') 806 452 230 44

$graphics.Dispose()
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
