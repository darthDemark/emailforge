/**
 * Intentionally flawed sample email used to demonstrate the rule engine.
 * It contains common real-world mistakes (flexbox, missing alt/dimensions,
 * no DOCTYPE, JavaScript, weak CTA copy, no unsubscribe) so VALIDATE produces
 * a rich report out of the box.
 */
export const SAMPLE_EMAIL = `<html>
<head>
  <link rel="stylesheet" href="https://cdn.example.com/styles.css" />
  <script>console.log('tracking');</script>
</head>
<body style="font-family: 'Brand Sans', sans-serif;">
  <div style="display:flex; width:800px; margin:0 auto;">
    <div style="position:absolute; top:0;">
      <img src="https://cdn.example.com/hero-with-text.png" />
    </div>
    <h1 style="font-size:11px; color:#000000;">Mega Sale 100% FREE!!!</h1>
    <p style="font-size:11px;">Shop the collection today.</p>
    <a href="https://example.com/a" style="background:#3366ff; padding:6px;">Click here</a>
    <a href="https://example.com/b" style="background:#3366ff; padding:6px;">Submit</a>
    <a href="https://example.com/c" style="background:#3366ff; padding:6px;">Read more</a>
    <a href="https://example.com/d" style="background:#3366ff; padding:6px;">Here</a>
  </div>
</body>
</html>`;
