"use strict";

var hexpress = require('./hexpress');
var app = hexpress();

// Simple route '/' that should replace the :fname and :lname
// params with alternative words and place them in req.params
app.get('/:fname/and/:lname', function(req, res) {
  console.log('something')
  res.json(req.params);
});

// Verify Your Solution:
// 1. http://localhost:3000/prath/and/desai
// 2. You should see {"fname":"prath","lname":"desai"}
// 3. http://localhost:3000/moose/and/paksoy
// 4. should see {"fname":"moose","lname":"paksoy"}
//

app.listen(3000);
