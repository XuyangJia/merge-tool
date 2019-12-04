function checkout (zones) {
  const countrys = zones.map(item => {
    return [`${item}_0`, `${item}_1`, `${item}_2`]
  })
  console.log(countrys)
  // console.log([ [ 'h1_0', 'h1_1', 'h1_2' ], [ 'h2_0', 'h2_1', 'h2_2' ] ].flat())
}
checkout(['h1', 'h2'])
