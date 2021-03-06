import jsbeautifier
import os
import codecs


opts = jsbeautifier.default_options()
opts.indent_size = 4
opts.jslint_happy = False
opts.end_with_newline = True
opts.break_chained_methods = True
opts.preserve_newlines = True
opts.max_preserve_newlines = 2

excludedDirs=["node_modules",".git","vendor","docs"]

for root, dirs, files in os.walk(os.getcwd(), topdown=True):
    #for dir in dirs:
    #    print(os.path.relpath(os.path.join(root,dir)));
    dirs[:] = [d for d in dirs if d not in excludedDirs]
    for file in files:
        if file.endswith(".js"):
            print("Formating {}".format(file));
            with codecs.open(os.path.join(root,file), 'r',"utf-8") as f:
                source=f.read();
            beauty = jsbeautifier.beautify(source,opts)
            if beauty == source:
                print(" - nothing to be made more beautiful");
                continue;
            #beauty=jsbeautifier.beautify_file(os.path.join(root,file), opts)
            with codecs.open(os.path.join(root,file), 'w',"utf-8") as f:
                f.write(beauty)
