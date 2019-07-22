// variables
let palettes;
let paletteIndex = 0;
let clickedColorIndex = 0;
let colorCardBig = false;

// document loaded
$(document).ready(() => {
  fitty('.palette-name', {maxSize: 100} );
  loadPaletteJson();

  $('#color-input').spectrum({
    flat: true,
    showInput: true,
    showPalette: true,
    palette: []
  });

});


// other functions
let loadPaletteJson = () => {
  $.getJSON("data/palettes.json", function(json) {
    palettes = json["palettes"];
    console.log("palettes", palettes);
    for (let i = 0; i < palettes.length; i++) {
      palettes[i].percentages = [];
      palettes[i].colorSwatches = [];
      palettes[i].domElement = createPalette(palettes[i]);
    }
    loadPalette(palettes[0]);
  });
};

let createPalette = (palette) => {

  // create dom element
  let paletteDom = $('<li>', {class: 'list-group-item'});
  $('.palette-list').append(paletteDom);
  let circleDom = $('<div>', {class: 'list-color-circle'});
  paletteDom.append(circleDom);
  let mediaDom = $('<div>', {class: 'media-body'});
  paletteDom.append(mediaDom);
  let nameDom = $('<strong>');
  mediaDom.append(nameDom);
  let descDom = $('<p>');
  mediaDom.append(descDom);

  // fill in text
  nameDom.html(palette.name);
  descDom.html(palette.description);

  // fill in colors
  circleDom.css('background-color', palette.colors[0]);
  let secondaryColors = "";
  for (let i = 1; i < palette.colors.length; i++) {
    secondaryColors += (i * 20) + "px 0 0 0 " + palette.colors[i];
    if (i < palette.colors.length - 1) {
      secondaryColors += ", ";
    }
  }
  circleDom.css('box-shadow', secondaryColors);

  // event listeners
  paletteDom.click(function() {
    loadPalette(palette);
  });

  return paletteDom;
};


let loadPalette = (palette) => {

  // activate on sidebar
  for (let i = 0; i < palettes.length; i++) {
    palettes[i].domElement.removeClass('active');
    if (palettes[i].domElement[0] == palette.domElement[0]) {
      paletteIndex = i;
      palettes[paletteIndex].domElement.addClass('active');
    }
  }


  // fill in details on main page
  $('.palette-name').html(palette.name);
  $('.palette-description').html(palette.description);

  // fill in colors
  $('.palette-color-container').html("");
  $('.palette-shadow-container').html("");
  let percentages = generatePercentages(palette.colors.length, 10, 80);
  let reddest = {diff: 255, color: "#e65d4f"};
  let bluest = {diff: 255, color: "#3498db"};
  for (let i = 0; i < palette.colors.length; i++) {
    let swatchSize = percentages[i] + "%";

    let colorSwatch = $('<div>', {class: 'palette-color'});
    colorSwatch.css('background-color', palette.colors[i]);
    colorSwatch.css('width', swatchSize);
    palette.percentages[i] = swatchSize;
    palette.colorSwatches[i] = colorSwatch;
    $('.palette-color-container').append(colorSwatch)
    colorSwatch.click((event) => {
      console.log("color swatch " + i + " clicked");
      clickedColorIndex = i;
      colorCardClicked(i);
    });

    let shadowSwatch = $('<div>', {class: 'palette-shadow'});
    shadowSwatch.css('background-color', lightenColor(palette.colors[i], -0.2));
    //shadowSwatch.css('background-color', palette.colors[i]);
    shadowSwatch.css('width', swatchSize);
    $('.palette-shadow-container').append(shadowSwatch);

    let redDiff = colorDifference(hexToRgb("#e65d4f"), hexToRgb(palette.colors[i]));
    if (redDiff < reddest.diff) { reddest.diff = redDiff; reddest.color = palette.colors[i]; }

    let blueDiff = colorDifference(hexToRgb("#3498db"), hexToRgb(palette.colors[i]));
    if (blueDiff < bluest.diff) { bluest.diff = blueDiff; bluest.color = palette.colors[i]; }
  }

  $('#color-input').spectrum({
    flat: true,
    showInput: true,
    showPalette: true,
    palette: [palette.colors]
  })

  // buttons
  $('.palette-button-add-color').css('background-color', bluest.color);
  $('.palette-button-delete-palette').css('background-color', reddest.color);

  // color card
  $('.color-card-text').hide();
  $('.color-card').css('background-color', palette.colors[0]);
  $('.color-card').css('width', percentages[0] + "%");
  $('.color-card').css('left', "0");
  $('.color-card').click(() => {
    console.log("full size color clicked");
    colorCardClicked(clickedColorIndex);
  });

  // name box
  fitty.fitAll();
};


let search = () => {

  console.log("searching for ", $('#palette-search-input').val());
  let searchTerm = $('#palette-search-input').val().toLowerCase();
  $('.palette-list').html("");

  if (searchTerm != "") {
    for (let i = 0; i < palettes.length; i++) {
      if (palettes[i].name.toLowerCase().includes(searchTerm)) {
          palettes[i].domElement = createPalette(palettes[i]);
      }
    }
  } else {
    for (let i = 0; i < palettes.length; i++) {
      palettes[i].domElement = createPalette(palettes[i]);
    }
  }
};


let colorCardClicked = (colorIndex) => {

  let leftPosition = $(palettes[paletteIndex].colorSwatches[colorIndex]).position().left;
  let colorCard = $('.color-card');
  colorCard.css('background-color', palettes[paletteIndex].colors[colorIndex]);
  colorCard.css('width', palettes[paletteIndex].percentages[colorIndex]);
  colorCard.css('left', leftPosition);

  console.log("is it big?", colorCardBig);
  if (colorCardBig) {
    // shrink
    colorCardBig = false;
    colorCard.animate({
      'height': '110px',
      'width': palettes[paletteIndex].percentages[colorIndex],
      'left': leftPosition,
      'border-bottom-left-radius': '50%',
      'border-bottom-right-radius': '50%'
    }, {duration: 500, complete: () => {
        $('.color-card-text').hide();
    }});
  } else {
    // gro
    colorCardBig = true;
    $('.color-card-text').show();
    colorCard.animate({
      'height': '100%',
      'width': '100%',
      'left': '0',
      'border-bottom-left-radius': '0',
      'border-bottom-right-radius': '0'
    }, {duration: 500});
  }

};



// color things

let generatePercentages = (count, min, max) => {

  let percentages = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    let randomPercentage = Math.floor(Math.random() * (max - min + 1)) + min
    percentages.push(randomPercentage);
    total += randomPercentage;
  }
  for (let i = 0; i < count; i++) {
    percentages[i] = (percentages[i] / total) * 100;
  }
  return percentages;
};

let colorDifference = (color1, color2) => {

    var sumOfSquares = 0;

    sumOfSquares += Math.pow(color1.r - color2.r, 2);
    sumOfSquares += Math.pow(color1.g - color2.g, 2);
    sumOfSquares += Math.pow(color1.b - color2.b, 2);

    return Math.sqrt(sumOfSquares);
};


let lightenColor = (hex, lum) => {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
};

let hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
