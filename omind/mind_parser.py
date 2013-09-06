from xml.etree import ElementTree as ET

HGAP=10
VHAP=20
LAY_LEFT = 0
LAY_RIGHT = 1
LAY_ROOT = 2

class _node_parser:
    def parse_node(self, ctx, xml_root, xml_node, child, root, node):
        node.go_child(ctx, xml_root, xml_node, child, root);

    def parse_icon(self, ctx, xml_root, xml_node, child, root, node):
        node.icon = child.attrib['BUILTIN']
        
    def parse(self, ns, xml_root, xml_node, child,  root, node):
        f = getattr(self, "parse_"+child.tag, None)
        if f:
            f(ns, xml_root, xml_node, child, root, node)

class _node_base:
    def __init__(self):
        self.childs = [];

    def go(self, ctx, xml_root, xml_node, root):
        self.id = xml_node.attrib['ID']
        self.text = xml_node.attrib['TEXT']
        ctx.root_stack.append(self);
        for child in xml_node.getchildren():
            ctx.parser.parse(ctx, xml_root, xml_node, child, root, self)

    def back(self, ctx, xml_root, xml_node, root):
        pass

class _node_root(_node_base):
    def __init__(self):
        self.childs = []
        self.left_childs = []
        self.right_childs = []

    def go_child(self, ctx, xml_root, xml_node, child, root):
        n = None;
        if child.attrib['POSITION'] == "left":
            n = _node_left()
            self.left_childs.append(n)
        else:
            n = _node_right()
            self.right_childs.append(n)
        ctx.ns.push(xml_node, child, self, n, True);
        self.childs.append(n)
    
    def back(self, ctx, xml_root, xml_node, root):
        ctx.html_string += '<div id="' + self.id + '" class="window mindroot">' + self.text + '</div>\n';
        str_obj = 'theObjMap.' + self.id;
        ctx.obj_string += str_obj + ' = theRoot;\n';
        ctx.obj_string += str_obj + '.id = "' + self.id + '";\n';
        str = ''
        for c in self.childs:
            str += 'theObjMap.' + c.id + ', '
        if len(str) > 0:
            str = str[0:len(str)-2]
        ctx.link_string += str_obj + '.child = ' + '[' + str + '];\n';
        str = ''
        for c in self.left_childs:
            str += 'theObjMap.' + c.id + ', '
        if len(str) > 0:
            str = str[0:len(str)-2]
        ctx.link_string += str_obj + '.left_child = ' + '[' + str + '];\n';
        str = ''
        for c in self.right_childs:
            str += 'theObjMap.' + c.id + ', '
        if len(str) > 0:
            str = str[0:len(str)-2]
        ctx.link_string += str_obj + '.right_child = ' + '[' + str + '];\n';
        ctx.leaf_stack.append(self);

class _node_right(_node_base):
    def go_child(self, ctx, xml_root, xml_node, child, root):
        n = _node_right()
        ctx.ns.push(xml_node, child, self, n, True);
        self.childs.append(n);
    
    def back(self, ctx, xml_root, xml_node, root):
        ctx.html_string += '<div id="' + self.id + '" class="window mindleaf">' + self.text + '</div>\n';
        str_obj = 'theObjMap.' + self.id;
        ctx.obj_string += str_obj + ' = new right_imp();\n';
        ctx.obj_string += str_obj + '.id = "' + self.id + '";\n';
        str = ''
        for c in self.childs:
            str += 'theObjMap.' + c.id + ', '
        if len(str) > 0:
            str = str[0:len(str)-2]
        ctx.link_string += str_obj + '.child = ' + '[' + str + '];\n';
        ctx.leaf_stack.append(self);
    
class _node_left(_node_base):
    def go_child(self, ctx, xml_root, xml_node, child, root):
        n = _node_left()
        ctx.ns.push(xml_node, child, self, n, True);
        self.childs.append(n);
    
    def back(self, ctx, xml_root, xml_node, root):
        ctx.html_string += '<div id="' + self.id + '" class="window mindleaf">' + self.text + '</div>\n';
        str_obj = 'theObjMap.' + self.id;
        ctx.obj_string += str_obj + ' = new left_imp();\n';
        ctx.obj_string += str_obj + '.id = "' + self.id + '";\n';
        str = ''
        for c in self.childs:
            str += 'theObjMap.' + c.id + ', '
        if len(str) > 0:
            str = str[0:len(str)-2]
        ctx.link_string += str_obj + '.child = ' + '[' + str + '];\n';
        ctx.leaf_stack.append(self);

class _node_stack_node:
    def __init__(self, xml_root, xml_node, root, node, go):
        self.xml_root = xml_root;
        self.xml_node = xml_node;
        self.root = root;
        self.node = node;
        self.go = go;

class _node_stack:
    def __init__(self):
        self.stack = [];
    def push(self, xml_root,xml_node,root,node,go):
        self.stack.append(_node_stack_node(xml_root,xml_node,root,node,go));
    def leaf_first(self):
        while len(self.stack) > 0:
            node = self.stack[len(self.stack)-1];
            if node.go:
                yield node;
                node.go = False;
            else:
                yield node;
                self.stack.pop();

class xml_context:
    def __init__(self):
        self.ns = _node_stack();
        self.parser = _node_parser();
        self.the_root = _node_root();
        self.leaf_stack = [];
        self.root_stack = [];
        self.html_string = ''
        self.script_string = ''
        self.obj_string = ''
        self.link_string = ''

def xml_leaf_first(ctx, map):
    ctx.ns.push(map, map.getchildren()[0], None, ctx.the_root, True);
    for ns_node in ctx.ns.leaf_first():
        if ns_node.go:
            ns_node.node.go(ctx, ns_node.xml_root, ns_node.xml_node, ns_node.root)
        else:
            ns_node.node.back(ctx, ns_node.xml_root, ns_node.xml_node, ns_node.root)

def mind_read_xml(path, ctx):
    xml = ET.parse(path);
    map = xml.getroot();
    xml_leaf_first(ctx, map)
    ctx.script_string = ctx.obj_string + ctx.link_string;
    '''str = "";
    str2 = "";
    for n in ctx.root_stack:
        str += "theObjMap." + n.id + ", "
        str2 += n.text + " "
    print str2 + "\n\n"
    if len(str) > 0:
        str = str[0:len(str)-2]
    str = 'window.mindMap.root_iter = ['+str+'];\n'
    ctx.script_string += str;'''
    str = "";
    for n in ctx.leaf_stack:
        str += "theObjMap." + n.id + ", "
    if len(str) > 0:
        str = str[0:len(str)-2]
    str = 'window.mindMap.leaf_iter = ['+str+'];\n'
    ctx.script_string += str;
