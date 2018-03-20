'use strict';

import * as vscode from 'vscode';

var config = vscode.workspace.getConfiguration('favorites');

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
        
        if(files.includes(path)) 
            files.splice(files.indexOf(path, 1));

        files.unshift(path);

        set(files);

        vscode.window.showInformationMessage('Favorites: added ' + path)
    }
    
    function del({ document }){
        var path = document && document.fileName;
        
        if (!path) return;
        
        if(files.includes(path))
            files.splice(files.indexOf(path), 1)
        
        set(files)
        
        vscode.window.showInformationMessage('Favorites: removed ' + path)
    }

    function open(editor){
        
        vscode.window.showQuickPick(files)
            .then(file => file || Promise.reject(null))
            .then(vscode.workspace.openTextDocument)
            .then(
                doc => vscode.window.showTextDocument(doc),  
                err => err && vscode.window.showErrorMessage(err)
            )
    }

    function get(){

        var files = context.globalState.get('files');
        
        return files ? JSON.parse(files) : [];
    }

    function set(files){

        context.globalState.update('files', JSON.stringify(files))
    }
}
