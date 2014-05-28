/*(function(){

})();
*/
(function(){
	Parse.initialize("sWPRrHNrFVaQF5TVBREF3b6ZzlnQXdNaAMKpwuyq","YaDPDKiWIccpcaQt2PJL5Q0O2Uqy3Ybr0z79Obw3");
	var e={};
	["loginView","evaluationView","updateSuccessView"].forEach(function(t){
		templateCode=document.getElementById(t).text;
		e[t]=doT.template(templateCode)
	});
	var t={
		loginRequiredView:function(e){
			return function(){
				var t=Parse.User.current();
				if(t){
					e()
				}else{
					window.location.hash="login/"+window.location.hash
				}
			}
		}
	};
	/* Handler Functions */
	var handler={
		navbar:function(){
			var e=Parse.User.current();
			if(e){
				 // Determine what authenticated user can see......  
				document.getElementById("loginButton").style.display="none";
				document.getElementById("logoutButton").style.display="block";
				document.getElementById("evaluationButton").style.display="block"
			}else{
				// Or anonymous user can see.
				document.getElementById("loginButton").style.display="block";
				document.getElementById("logoutButton").style.display="none";
				document.getElementById("evaluationButton").style.display="none"
			}
			document.getElementById("logoutButton").addEventListener("click",function(){
				Parse.User.logOut();handler.navbar();
				window.location.hash="login/"
			})
		},
		evaluationView:t.loginRequiredView(function(){
			var t=Parse.Object.extend("Evaluation");
			var handler=Parse.User.current();
			var r=new Parse.ACL;
			r.setPublicReadAccess(false);
			r.setPublicWriteAccess(false);
			r.setReadAccess(handler,true);
			r.setWriteAccess(handler,true);
			var i=new Parse.Query(t);
			i.equalTo("user",handler);
			i.first({
				success:function(i){
					window.EVAL=i;
					if(i===undefined){
						var s=TAHelp.getMemberlistOf(handler.get("username")).filter(function(e){
							return e.StudentId!==handler.get("username")?true:false}).map(function(e){
								e.scores=["0","0","0","0"];
								return e
							})
					}else{
						var s=i.toJSON().evaluations
					}
					document.getElementById("content").innerHTML=e.evaluationView(s);
					document.getElementById("evaluationForm-submit").value=i===undefined?"�銵典":"靽格銵典";
					document.getElementById("evaluationForm").addEventListener("submit",function(){
						for(var o=0;o<s.length;o++){
							for(var u=0;u<s[o].scores.length;u++){
								var a=document.getElementById("stu"+s[o].StudentId+"-q"+u);
								var f=a.options[a.selectedIndex].value;s[o].scores[u]=f
							}
						}
						if(i===undefined){
							i=new t;i.set("user",handler);
							i.setACL(r)
						}
						console.log(s);
						i.set("evaluations",s);
						i.save(null,{success:function(){document.getElementById("content").innerHTML=e.updateSuccessView()},error:function(){}})
					},false)
				},error:function(e,t){}
			})
		}),
		loginView:function(t){
			var r=function(e){
				var t=document.getElementById(e).value;
				return TAHelp.getMemberlistOf(t)===false?false:true
			};
			var i=function(e,t,handler){
				if(!t()){
					document.getElementById(e).innerHTML=handler;
					document.getElementById(e).style.display="block"
				}else{
					document.getElementById(e).style.display="none"
				}
			};
			var s=function(){
				handler.navbar();window.location.hash=t?t:""
			};
			var o=function(){
				var e=document.getElementById("form-signup-password");
				var t=document.getElementById("form-signup-password1");
				var handler=e.value===t.value?true:false;
				i("form-signup-message",function(){return handler},"Passwords don't match.");
				return handler
			};
			document.getElementById("content").innerHTML=e.loginView();
			document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
				i("form-signin-message",function(){
					return r("form-signin-student-id")
				},"The student is not one of the class students.")
			});
			document.getElementById("form-signin").addEventListener("submit",function(){
				if(!r("form-signin-student-id")){
					alert("The student is not one of the class students.");
					return false
				}
				Parse.User.logIn(document.getElementById("form-signin-student-id").value,document.getElementById("form-signin-password").value,{
					success:function(e){
						s()
					},error:function(e,t){
						i("form-signin-message",function(){
							return false
						},"Invaild username or password.")
					}
				})
			},false);
			document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
				i("form-signup-message",function(){
					return r("form-signup-student-id")
				},"The student is not one of the class students.")
			});
			document.getElementById("form-signup-password1").addEventListener("keyup",o);
			document.getElementById("form-signup").addEventListener("submit",function(){
				if(!r("form-signup-student-id")){
					alert("The student is not one of the class students.");
					return false
				}
				var e=o();
				if(!e){
					return false
				}
				var t=new Parse.User;
				t.set("username",document.getElementById("form-signup-student-id").value);
				t.set("password",document.getElementById("form-signup-password").value);
				t.set("email",document.getElementById("form-signup-email").value);
				t.signUp(null,{
					success:function(e){s()},
					error:function(e,t){
						i("form-signup-message",function(){
							return false
						},t.message)
					}
				})
			},false)
		}
	};
	var r=Parse.Router.extend({
		routes:{
			"":"indexView",
			"peer-evaluation/":"evaluationView",
			"login/*redirect":"loginView"
		},
		indexView:handler.evaluationView,
		evaluationView:handler.evaluationView,
		loginView:handler.loginView
	});
	this.Router=new r;
	Parse.history.start();
	handler.navbar()
})();