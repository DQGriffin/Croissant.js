var fs = require('fs');
var xml2js = require('xml2js')
var IVRMenu = require('./IVRMenu')
var IVRKeyPress = require('./IVRKeyPress')

class XMLReader {
    
    constructor(xmlFilePath) {
        this.rawData = []
        this.menus = []

        this.xmlData = fs.readFileSync(xmlFilePath, 'utf8');
        xml2js.parseString(this.xmlData, (err, result) => {
            if(err) {
                throw err;
            }
        
            // `result` is a JavaScript object
            // convert it to a JSON string
            const json = JSON.stringify(result, null, 4);
        
            // log JSON string
            //console.log(json);

            this.rawData = result
            
            //console.log(this.rawData['MultilevelIVR']['Menu'][0]['Extension'][0])
        });
    }

    getMenus() {
        const menuCount = this.rawData["MultilevelIVR"]["Menu"].length
        //console.log('Menus: ' + menuCount)

        for (let i = 0; i < menuCount; i++) {
            let menuData = this.rawData["MultilevelIVR"]["Menu"][i]
            this.parseMenu(menuData)
        }
        return this.menus
    }
    
    parseMenu(menuData) {
        let menuName = menuData['Name'][0]
        let extensionNumber = menuData['Extension'][0]
        let prompt = ""
        if ('Text' in menuData['Prompt'][0]) {
            prompt = menuData['Prompt'][0]['Text'][0]
        }

        prompt = prompt.replace(/(\r\n|\n|\r)/gm, " ")
        
        let menu = new IVRMenu(menuName, extensionNumber, prompt)
        
        let keyPresses = menuData['CallHandling'][0]['DigitKeyInput']

        if (keyPresses != undefined) {
            for (let keyPressIndex = 0; keyPressIndex < keyPresses.length; keyPressIndex++) {
                let key = keyPresses[keyPressIndex]['Key'][0]
                let action = keyPresses[keyPressIndex]['Action'][0]
    
                if (action != 'ConnectToDialByNameDirectory') {
                    let destination = keyPresses[keyPressIndex]['Destination'][0]
    
                    let keyPress = new IVRKeyPress(key, action, destination)
                    menu.actions.push(keyPress)
                }
                else {
                    let keyPress = new IVRKeyPress(key, action, "")
                    menu.actions.push(keyPress)
                }
            }
        }
        this.menus.push(menu)
       // console.log(menu)

    }

}

module.exports = XMLReader