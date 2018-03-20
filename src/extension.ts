'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs'

const log = console.log.bind(console),
      error = console.error.bind(console);

export function activate(context) {

    var files = get();

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('favorites.add', add),
        vscode.commands.registerTextEditorCommand('favorites.del', del),
        vscode.commands.registerCommand('favorites.open', open)
    );

    function add({ document }){

        var path = document && document.fileName;
        
        if(!path) return;
        
        remove(path)

        files.unshift(path);

        set(files);

        vscode.window.showInformationMessage('Favorites: added ' + path)
    }
    
    function del({ document }){
        var path = document && document.fileName;
        
        if (!path) return;
        
        remove(path);

        set(files)
        
        vscode.window.showInformationMessage('Favorites: removed ' + path)
    }

    function remove(path){

        if (files.includes(path))
            files.splice(files.indexOf(path), 1)
            
        return  files;
    }

    function open(editor){

        var path;
        
        vscode.window.showQuickPick(files)
            .then(file => (path = file) || Promise.reject(null))
            .then(vscode.workspace.openTextDocument)
            .then(
                doc => vscode.window.showTextDocument(doc),  
                err => {
                    if(!err) return ;
                    vscode.window.showErrorMessage('Favorites: can\'t open ' + path);
                    set(remove(path));
                    vscode.window.showInformationMessage('Favorites: remove ' + path);
                }
            )
    }

    function get(){

        var files = context.globalState.get('files');

        files = files ? JSON.parse(files) : [];

        files = files.filter(path => fs.existsSync(path))
        
        set(files);

        return files;
    }

    function set(files){

        context.globalState.update('files', JSON.stringify(files))
    }
}
