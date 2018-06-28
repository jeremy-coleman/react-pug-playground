import * as React from 'react';
import styled from 'react-emotion';

import 'styles/index.scss';

const MainContainer = styled('section')({
    background: "lightsalmon",
    color: "black",
    padding: 20,
})

interface IAppProps {
    isLogged?: boolean;
    appName?: string;
}

interface IAppState {
}


export class App extends React.Component<IAppProps, IAppState> {
    state = {
    }

    renderTitle() {
        return <p>{this.props.appName}</p>;
    }

    render() {
        return pug`
            MainContainer
                section
                    h1 SUCCESS BOIS
                    p pug working!
        `;
    }
}

