var express = require('express');
var fs = require('fs');///////////
var path = require('path');
var multiparty = require('multiparty');
var router = express.Router();
var app = express();

/* GET index page. */
router.get('/index', function(req, res,next) {
  res.render('index', { title: 'Express' });
});


/*GET upload page. */
//홈화면 보내주기
app.get('/index', function(req, res, next) {
	fs.readFile('./index.html', function(error, data) {
		if(error != undefined) {
			res.writeHead(404);
			res.end();
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data);
		}
	});
});


/* GET login page. */
router.route("/").get(function(req,res){    
	res.render("login",{title:'User Login'});
}).post(function(req,res){ 					   
	//get User info
	var User = global.dbHandel.getModel('user');  
	var uname = req.body.uname;				
	User.findOne({name:uname},function(err,doc){   
		if(err){ 										
			res.send(500);
			console.log(err);
		}else if(!doc){ 						
			req.session.error = '사용자가 존재하지 않습니다';
			res.send(404);						
		//	res.redirect("/login");
		}else{ 
			if(req.body.upwd != doc.password){ 	
				req.session.error = "비밀번호가 올바르지 않습니다";
				res.send(404);
			//	res.redirect("/login");
			}else{ 									
				req.session.user = doc;
				res.send(200);
			//	res.redirect("/home");
			}
		}
	});
});


app.post('/file-upload', function(req, res) {
    // get the temporary location of the file
    var tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory

    var target_path = './' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location

    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files

        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    });
});


/* GET register page. */
router.route("/register").get(function(req,res){    
	res.render("register",{title:'User register'});
}).post(function(req,res){ 
	var User = global.dbHandel.getModel('user');
	var uname = req.body.uname;
	var upwd = req.body.upwd;
	User.findOne({name: uname},function(err,doc){   
		if(err){ 
			res.send(500);
			req.session.error =  '네트워크 오류';
			console.log(err);
		}else if(doc){ 
			req.session.error = '아이디 중복';
			res.send(500);
		}else{ 
			User.create({ 							
				name: uname,
				password: upwd
			},function(err,doc){ 
				 if (err) {
                        res.send(500);
                        console.log(err);
                    } else {
                        req.session.error = '등록 완료';
                        res.send(200);
                    }
                  }); 
		}
	});
});
/* GET home page. */
router.get("/home",function(req,res){ 
	if(!req.session.user){ 					
		req.session.error = "로그인"
		res.redirect("/login");				
	}
	res.render("home",{title:'Home'});         
});


/* GET logout page. */
router.get("/logout",function(req,res){    
//	req.session.user = null;
//	req.session.error = null;
//	res.redirect("/");
	var sess;
	sess = req.session;
    if(sess.username){
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
        })
    }else{
        res.redirect('/');
    }
	
});

app.listen(3030);
module.exports = router;
