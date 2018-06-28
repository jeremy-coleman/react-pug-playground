import "core-js";
import "@babel/polyfill"
import * as React from "react";
import * as ReactDOM from "react-dom";
import { initializeIcons } from "@uifabric/icons";
import { Fabric } from "office-ui-fabric-react";
import {ThemeProvider} from 'theming'

import {loadTheme} from 'office-ui-fabric-react'
import { App } from "./apps/App";

initializeIcons(AppConfig.env.fabricIconBasePath);

declare global {
    var pug: any;
}


let theme = loadTheme({})

ReactDOM.render(
    <Fabric>
    <ThemeProvider theme={theme}>
    <div>
    <App/>
    </div>
    </ThemeProvider>
    </Fabric>,
    document.getElementById("main")
);