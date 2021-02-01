import axios from 'axios';
import React, { Component } from 'react'; // React imports
import { Content, FlexboxGrid, Form, Header, Modal, FormControl, ControlLabel, FormGroup, Button, Alert, Schema } from 'rsuite';


import 'rsuite/dist/styles/rsuite-dark.css'; // Dark theme for rsuite components
// import 'bootstrap/dist/css/bootstrap.css'; //only used for global nav (black bar)

import './App.css';
import { gameServer } from './config';
import openSocket from 'socket.io-client';
import jwtDecode from 'jwt-decode' // JSON web-token decoder

import Actions from './components/Actions';
import Control from './components/navigation/control';
import HomePage from './components/navigation/homepage';
import MyCharacter from './components/navigation/myCharacter';
import NavigationBar from './components/navigation/navigationBar';
import OtherCharacters from './components/navigation/OtherCharacters';
import ControlTerminal from './components/navigation/ControlTerminal';
import Registration from './components/navigation/Registration';
const { StringType } = Schema.Types;

const socket = openSocket(gameServer);

// React App Component
class App extends Component {
  state = {
    gamestate: null,
    user: null,
    active: null,
    actions: [],
    players: [],
    formValue: {
      email: '',
      password: '',
    },
    show: true,
    loading: false,
    login: false,
    playerCharacter: null
  }

  componentDidMount = async () => {
    console.log('Mounting App...')
    let token = localStorage.getItem('token');
    console.log(token);
    // this.setState({ active: 'maintenence' }); //active: 'login' 
    if (token) {
      const user = jwtDecode(token);
        this.setState({ user, show: false, active: 'loading' });

        this.initData(user);
    }
    else {
      this.setState({ show: true, active: 'login' });
    }

    socket.on('connect', ()=> { console.log('UwU I made it') });
    socket.on('updateCharacters', (data) => { console.log("Characters:", data); this.setState({ players: data }) });
    socket.on('updateActions', (data )=> { console.log("Actions:", data); this.setState({ actions: data }); });
    socket.on('updateGamestate', (data) => { console.log("GameState:", data); this.setState({ gamestate: data }); });
    // await this.loadCharacters();    
    // await this.loadActions();
    // await this.loadGamestate();
  }

  render() {
    return(
      
      <div className="App" style={this.state.active === "loading" ? loading : done}>
        {this.state.active === "maintenence" && 
        <React.Fragment>
          <Header>
          </Header>
          <Content>
            <FlexboxGrid justify="center">
              <FlexboxGrid.Item key={1} colspan={12} style={{marginTop: '80px'}}>
                <img src={'https://media4.giphy.com/media/tJMVqwkdUIuL0Eiam3/source.gif'} alt={'Loading...'} />  
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content> <b>App Down for Server Maintenance</b>
        </React.Fragment>
        }
        {this.state.active === "loading" && 
        <React.Fragment>
          <Header>
          </Header>
          <Content>
            <FlexboxGrid justify="center">
              <FlexboxGrid.Item key={1} colspan={12} style={{marginTop: '80px'}}>
                <img src={'https://media4.giphy.com/media/tJMVqwkdUIuL0Eiam3/source.gif'} alt={'Loading...'} />  
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content> <b>Loading...</b>
        </React.Fragment>
        }
        {this.state.active === "unfound" && 
        <React.Fragment>
          <Header>
          </Header>
          <Content>
            <FlexboxGrid justify="center">
              <FlexboxGrid.Item key={1} colspan={12} style={{marginTop: '80px'}}>
                <img src={'https://steamuserimages-a.akamaihd.net/ugc/798744098479460748/5E7BF755F4F27E6876BD38BE11571E2C9952FCDA/'} alt={'No Character Found...'} />  
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Content> <b>Could not find a character with your username. Please contact Tech Support if you think this was in error</b>
        </React.Fragment>
        }
        { this.state.active !== "maintenence" && 
          <Modal backdrop="static" show={this.state.show}>
            <Modal.Header>
              <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form model={model} fluid formValue={this.state.formValue} onChange={this.handleChange.bind(this)}>
              <FormGroup>
                  <ControlLabel>Email / Username</ControlLabel>
                  <FormControl name="email" accepter={model.accepter}/>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Password</ControlLabel>
                  <FormControl name="password" type="password" />
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button loading={this.state.loading} onClick={this.handleLogin.bind(this)} appearance="primary">
                Submit
              </Button>
            </Modal.Footer>
          </Modal>        
        }

        {this.state.show === false && this.state.active !== "unfound" && this.state.active !== "loading" && 
          <React.Fragment>
            <Header>
              <NavigationBar user={this.state.user} gamestate={this.state.gamestate} onSelect={this.handleSelect.bind(this)}>
              </NavigationBar>
            </Header>
            {this.state.active === "home" && <HomePage gamestate={this.state.gamestate}/>}
            {this.state.active === "character" && <MyCharacter characters={this.state.players} playerCharacter={this.state.playerCharacter}/>}
            {this.state.active === "controllers" && <Control/>}
            {this.state.active === "others" && <OtherCharacters user={this.state.user} playerCharacter={this.state.playerCharacter} characters={this.state.players}/>}
            {this.state.active === "actions" && <Actions user={this.state.user} characters={this.state.players} gamestate={this.state.gamestate} playerCharacter={this.state.playerCharacter} actions={this.state.actions}/>}
            {this.state.active === "control" && <ControlTerminal playerCharacter={this.state.playerCharacter} characters={this.state.players} user={this.state.user} gamestate={this.state.gamestate} actions={this.state.actions}/>} 
            {this.state.active === "reg" && <Registration characters={this.state.players}/>} 
          </React.Fragment>
        }   
      </div>
    );
  }

  handleSelect(activeKey) {
    this.setState({ active: activeKey });
  }

  handleChange(value) {
    this.setState({
      formValue: value
    });
  }

  handleLogin = async () => {
    this.setState({ loading: true });
    try {
      const { data } = await axios.post(`https://nexus-central-server.herokuapp.com/auth`, { user: this.state.formValue.email, password: this.state.formValue.password });      
      // console.log(data);
      if (!data || data.length < 1) {
        this.setState({  });
      }
      else {
        localStorage.setItem('token', data);
        const user = jwtDecode(data);
        this.setState({ user, login: true });
        socket.emit('login', user);
        this.initData(user);          
      }    
    } 
    catch (err) {
      console.log(err)
      Alert.error(`Error: ${err.body} ${err.response.data}`, 5000);
      this.setState({ loading: false });
    }
    this.setState({ formValue: { email: '', password: '',}})
  }

  handleLogOut = async () => {
    let token = localStorage.removeItem('token');
    this.setState({ show: true, active: 'login' });
    console.log(token);
  }

  initData = async (user) => {
    try {
      const loadingData = await axios.patch(`${gameServer}api/characters/byUsername`, {username: user.username});
      // console.log(loadingData)
      if (!loadingData.data.playerCharacter) {
        this.setState({ show: false, active: "unfound" })        
      }
      else {
        this.setState({ show: false, playerCharacter: loadingData.data.playerCharacter, players: loadingData.data.players, assets: loadingData.data.assets, actions: loadingData.data.actions, gamestate: loadingData.data.gamestate, loading: false, active: 'home' });
      }
    }
    catch (err) {
      console.log(err)
      Alert.error(`Error: ${err} ${err}`, 5000);
      this.setState({ loading: false });
    }
  }
}

const loading = {
  position: 'fixed', backgroundColor: '#000000', top: 0, bottom: 0, width: '100%',
};

const done = {
  position: 'fixed', top: 0, bottom: 0, width: '100%',
}

const model = Schema.Model({
  email: StringType()
    .isRequired('This field is required.')
});

export default (App);