function getPageSize() {
    var xScroll, yScroll;
    if (window.innerHeight && window.scrollMaxY) {
        xScroll = window.innerWidth + window.scrollMaxX;
        yScroll = window.innerHeight + window.scrollMaxY;
    } else {
        if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac    
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari    
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }
    }
    var windowWidth, windowHeight;
    if (self.innerHeight) { // all except Explorer    
        if (document.documentElement.clientWidth) {
            windowWidth = document.documentElement.clientWidth;
        } else {
            windowWidth = self.innerWidth;
        }
        windowHeight = self.innerHeight;
    } else {
        if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode    
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else {
            if (document.body) { // other Explorers    
                windowWidth = document.body.clientWidth;
                windowHeight = document.body.clientHeight;
            }
        }
    }       
    // for small pages with total height less then height of the viewport    
    if (yScroll < windowHeight) {
        pageHeight = windowHeight;
    } else {
        pageHeight = yScroll;
    }    
    // for small pages with total width less then width of the viewport    
    if (xScroll < windowWidth) {
        pageWidth = xScroll;
    } else {
        pageWidth = windowWidth;
    }
    arrayPageSize = new Array(pageWidth, pageHeight, windowWidth, windowHeight);
    return arrayPageSize;
}
;(function() {
		var HGAP=10,VGAP=20, LAY_LEFT=0, LAY_RIGHT=1;
		var rightAnchors = [ [ 0.98, 1, 0, 0.1 ],  [ 0, 0.98, -0.2, 0 ]]; 
		var leftAnchors = [ [ 0.02, 1, 0, 0.1 ],  [ 1, 0.98, 0.2, 0 ]];
		window.mindMap = {
			interface_node:{
				layout:function(){
					this.layout_implement.apply(this, arguments);
				},
				first_process:function(tmp_size) {
					mind_node = this;
					var max_width = 0;
					mind_node.height = 0;
					$.each(mind_node.child,function(key,val){
						mind_node.height += val.height + HGAP;
						if(max_width < val.width){
							max_width = val.width;
						}
					});
					if(mind_node.height <= 0) {
						mind_node.height = tmp_size.h;
					}
					mind_node.width = tmp_size.w + max_width + VGAP;
					mind_node.ele_height = tmp_size.h;
					mind_node.ele_width = tmp_size.w;
				},
				connect:function(val){	
					var root = this;				
					jsPlumb.connect({
						source:root.id, 
							target:val.id, 			   	
							connector:"Bezier",
							cssClass:"c1",
							endpoint:"Blank",
							endpointClass:"c1Endpoint",													   
							anchors:val.get_anchor(), 
							paintStyle:{ 
							lineWidth:1,
							strokeStyle:"#346789",
							outlineWidth:1,
							outlineColor:"#666"
					}
					});
				}
			},
			root_imp:function(){
				var theRoot = this;
				theRoot.left_child = [];
				theRoot.right_child = [];
				theRoot.child = [];
				this.node_type = "root";
				theRoot.layout_implement = function(){
					var item, tmp_stack = [];
					theRoot.x = (theRoot.width-theRoot.ele_width)/2;
					theRoot.y = (theRoot.height-theRoot.ele_height)/2;
					$('#idOuterMap').css("width",theRoot.width);
					$('#idOuterMap').css("height",theRoot.height);
					$('#'+theRoot.id).css("left",theRoot.x);
					$('#'+theRoot.id).css("top",theRoot.y);	
					var y2 = (theRoot.left_height-theRoot.ele_height)/2;
					$.each(theRoot.left_child, function(key,val){
						var context = {"root":theRoot, "key":key, "val":val, "y2":y2};
						val.layout(context);
						theRoot.connect(val);
						y2 -= val.height + HGAP;
						tmp_stack.push(context);
					});
					
					y2 = (theRoot.right_height-theRoot.ele_height)/2;
					$.each(theRoot.right_child, function(key,val){
						var context = {"root":theRoot, "key":key, "val":val, "y2":y2};
						val.layout(context);
						theRoot.connect(val);
						y2 -= val.height + HGAP;
						tmp_stack.push(context);
						});
				
					while(tmp_stack.length > 0){
						item = tmp_stack.pop();
						y2 = (item.val.height-item.val.ele_height)/2;
						$.each(item.val.child, function(key,val){
								var context = {"root":item.val, "key":key, "val":val, "y2":y2};
								y2 -= val.height + HGAP;
								val.layout(context);
								item.val.connect(val);
								tmp_stack.push(context);
								});
					}
				};
				this.connect = function(val){
					var root = this;
					var anEndpoint = {
								endpoint:"Blank",
								isSource:true, 
								isTarget:true, 
								maxConnections:-1, 
								connector:"Bezier"
							};
							jsPlumb.connect({
									source:jsPlumb.addEndpoint(root.id, anEndpoint, {anchor:[ "Perimeter", { shape:"ellipse" } ]}),
									target:jsPlumb.addEndpoint(val.id, anEndpoint, {anchor:val.get_anchor()}),
									cssClass:"c1",
									endpointClass:"c1Endpoint",													   
									paintStyle:{ 
										lineWidth:1,
										strokeStyle:"#346789",
										outlineWidth:1,
										outlineColor:"#666"
									}
							});
				};
				this.first_process = function(tmp_size) {
					var theRoot = this;
					theRoot.height = 0, theRoot.width = 0;
					theRoot.left_height = 0, theRoot.right_height = 0;
					$.each(theRoot.left_child, function(key,val){
						theRoot.left_height += val.height;
						theRoot.width += val.width;
					});
					$.each(theRoot.right_child, function(key,val){
						theRoot.right_height += val.height;
						theRoot.width += val.width;
					});
					theRoot.width += tmp_size.w + 2 * VGAP;
					theRoot.height = (theRoot.left_height > theRoot.right_height?theRoot.left_height:theRoot.right_height);
					theRoot.height = (theRoot.height > tmp_size.h?theRoot.height:tmp_size.h);
					theRoot.ele_height = tmp_size.h;
					theRoot.ele_width = tmp_size.w;
				};
			},
			left_imp:function(){
				this.child = [];
				this.node_type = "left"; 
				this.layout_implement=function(context){
						var val = this, y2 = context.y2, root = context.root;
						val.x = root.x - val.ele_width - VGAP;
						val.y = root.y - y2 + (val.height - val.ele_height)/2;
						$('#'+val.id).css("left",val.x);
						$('#'+val.id).css("top",val.y);
				};
				this.get_anchor = function(){
					return leftAnchors;
				};
			},
			right_imp:function(){
				this.child = [];
				this.node_type = "right";
				this.layout_implement=function(context){
						var val = this, y2 = context.y2, root = context.root;
						val.x = root.x + root.ele_width + VGAP;
						val.y = root.y - y2 + (val.height - val.ele_height)/2;
						$('#'+val.id).css("left",val.x);
						$('#'+val.id).css("top",val.y);
				};
				this.get_anchor = function(){
					return rightAnchors;
				};
			},
			leaf_first:function(tree,child,fun){
				var node_stack = [];
				var node_trace, node;

				node_stack.push({"root":null, "key":0, "node":tree, "go":true});

				while(node_stack.length > 0) {
					node_trace = node_stack[node_stack.length-1];
					node = node_trace.node;
					if((node[child].length > 0) && node_trace.go) {
						$.each(node[child], function(key,val){
								node_stack.push({"root":node, "key":key, "node":val, "go":true});
								});
						node_trace.go = false;
					}
					else {
						fun(node_trace.root, node_trace.key, node);
						node_stack.pop();
					}
				}
			},
			root_first:function(tree,child,fun){
				var stack = [];
				var root;

				fun(null, 0, tree);
				stack.push(tree);
				while(stack.length > 0) {
					root = stack.pop();
					if(root[child].length > 0) {
						$.each(root[child], function(key,val){
								fun(root, key, val);
								stack.push(val);
								});
					}
				}
			},
			init:function(xml){
			theMe = mindMap;
			theMe.root_imp.prototype = new theMe.root_imp();
			jQuery.extend(theMe.root_imp.prototype,theMe.interface_node);
			theMe.left_imp.prototype = new theMe.left_imp();
			jQuery.extend(theMe.left_imp.prototype,theMe.interface_node);
			theMe.right_imp.prototype = new theMe.right_imp();
			jQuery.extend(theMe.right_imp.prototype,theMe.interface_node);

			theMe.arrow_links = [];
			var arrow_links = theMe.arrow_links;
			theMe.root = new theMe.root_imp();
			var theRoot = theMe.root;
			var map_dom = $("#idMap");
			var str_dom = "";
			var map, root;

			map = $(xml).find("map");
			/*map = map.get(0);
			map = $(map);
			root = map.children[0];*/
			theMe.version = map.attr("version");
			root = map.children("node");
			theRoot.id = root.attr("ID");
			theRoot.text = root.attr("TEXT");

			{
				var node_stack = [];
				var node_trace, node, nodes, mind_node, mroot, tmp_size, max_width;
				var tree = root;
											
				var idHidden = $("#idHidden");
				var get_tmp_size = function(txt){
					var s = {};
					idHidden.html(txt);
					s.h = idHidden.height(), s.w = idHidden.width();
					return s;
				}
				var get_arrow_link = function(node){
					var ars = node.children("arrowlink");
					ars.each(function(key,v){
							var val = $(v);	
							var ar = {"source_id":node.attr("ID"),"dest_id":val.attr("DESTINATION"),"end_arrow":val.attr("ENDARROW")};
							arrow_links.push(ar);
							});
				};
				
				get_arrow_link(tree);
				nodes = tree.children("node");
				nodes.each(function(key,val){
					if($(val).attr("POSITION") == "left"){
						node_stack.push({"root":tree, "key":key, "node":val, "go":true
						, "mroot":theRoot, "layout":LAY_LEFT});
						mind_node = new theMe.left_imp();
						theRoot.child.push(mind_node);
						theRoot.left_child.push(mind_node);
					}
					else {
						node_stack.push({"root":tree, "key":key, "node":val, "go":true
						, "mroot":theRoot, "layout":LAY_RIGHT});
						mind_node = new theMe.right_imp();
						theRoot.child.push(mind_node);
						theRoot.right_child.push(mind_node);
					}
				});
				while(node_stack.length > 0) {
					node_trace = node_stack[node_stack.length-1];
					node = $(node_trace.node);
					nodes = node.children("node");
					mroot = node_trace.mroot.child[node_trace.key];
					if((nodes.size() > 0) && node_trace.go) {
						nodes.each(function(key,val){
							if(node_trace.layout == LAY_LEFT){
								mind_node = new theMe.left_imp();
							}
							else {
								mind_node = new theMe.right_imp();
							}
							node_stack.push({"root":node, "key":key, "node":val, "go":true
							, "mroot":mroot, "layout":node_trace.layout});
							mroot.child.push(mind_node);
							});
							
						node_trace.go = false;
					}
					else {
						mind_node = mroot;
						mind_node.text = node.attr("TEXT");
						mind_node.id = node.attr("ID");
						str_dom += '<div id='+ mind_node.id + ' class="window mindleaf">' + mind_node.text + '</div>';
						get_arrow_link(node);
						mind_node.first_process(get_tmp_size(mind_node.text));									
						node_stack.pop();
					}
				}
				
				str_dom += '<div id='+ theRoot.id + ' class="window mindroot">' + theRoot.text + '</div>';
				map_dom.html(str_dom);

				setTimeout(function(){
					var id = $("#"+theRoot.id);
					var s = {};
					s.h = id.height();
					s.w = id.width();
					theRoot.first_process(s);
					theRoot.layout();	
				
					var link_anchors = [ [ 1.04, 0.5, 1, 0 ],  [ 1.04, 0.5, 1, 0 ]];
					$.each(arrow_links, function(key, val){
							jsPlumb.connect({
								source:val.source_id, 
									target:val.dest_id, 			   	
									connector:"Bezier",
									cssClass:"c1",
									endpoint:"Blank",
									endpointClass:"c1Endpoint",													   
									anchors:link_anchors, 
									paintStyle:{ 
										lineWidth:1,
										strokeStyle:"#346789",
										outlineWidth:1,
										outlineColor:"#666"
									},
									overlays:[ ["PlainArrow", {location:1, width:20, length:12} ]]
							});
					});
					
					var ss = getPageSize();
					$(document).scrollTop(theRoot.y-ss[3]/2);
					$(document).scrollLeft(theRoot.x-ss[3]/2);
				},100);
			
			}
			
			}
	
		};
})();
