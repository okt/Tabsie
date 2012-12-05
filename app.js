/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')

var app = express()
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))
app.use(express.bodyParser())

app.post('/', function(req, res){
	var PDFDocument 	= require('pdfkit');
	var doc 			= new PDFDocument({
		info: {
		    Title: 'Tab Document',
		    Author: 'Tabsie'
		},
		size: [648, 792],
  		layout: 'landscape',
  		margins: 0,
	});

	var name 			= req.body.name
	var bank 			= req.body.bank
	var captions 		= req.body.captions
	var pre_cut			= req.body.pre_cut
	var caps 			= req.body.caps
	var small			= req.body.small
	var tab_pos 		= 0
	var tab_margin 	= 18 // 72 * 0.25in;
	var counter 		= 0
	var tab_width 		= (792 - (tab_margin * 2)) / bank;

	// Move initial position past the margin
	tab_pos += tab_margin;
	// { size: '792, 648', layout: 'landscape' }
	doc.font('Helvetica');

	if (small) {
		doc.fontSize('9');
	} else {
		doc.fontSize('11');
	};


	if (caps) {
		captions = captions.toUpperCase();
	};

	captions = captions.split(",")

	captions.forEach(function(caption) {
		caption = caption.trim();

		if (pre_cut) {
			if (counter == bank) {
				counter = 0;
				tab_pos -= (tab_width * bank);
			};

			doc.text(caption, tab_pos, 9, {
			  width: tab_width,
			  height: 36,
			  align: 'center'
			});

			if (caption !== captions.slice(-1)[0].trim()) {
				doc.addPage();
			};

			tab_pos += tab_width;
			counter += 1;
		} else {
			if (counter == bank) {
				counter = 0;
				tab_pos -= (tab_width * bank);
				doc.addPage();
			};

			doc.text(caption, tab_pos, 9, {
			  width: tab_width,
			  height: 36,
			  align: 'center'
			});

			tab_pos += tab_width;
			counter += 1;
		};
	});

	tabfile = 'processed_tabs/' + name + '_' + bank + 'BANK.pdf';
	doc.write('public/' + tabfile);

// render the file download page, and pass through the filename
// for a link
    res.render('file',
	  {
	  	title : 'File Download',
	  	file : tabfile,
	  	file_name : name + '_' + bank + 'BANK.pdf'
	  }
	  );
});

app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})
app.listen(3000);
