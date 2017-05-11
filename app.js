import React, { Component } from 'react';

import {
  AppRegistry,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ListView,
  StatusBar,
  TouchableHighlight,
} from 'react-native';

import Button from 'apsl-react-native-button'

import {Client, Server} from './udp';

class MainScreen extends Component {
  static navigationOptions = {
    title: 'Slideshow',
  };

  constructor(props) {
    super(props);

    const udpClient = new Client();
    const udpServer = new Server();

    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.pressRow = this.pressRow.bind(this);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {server: udpServer, client: udpClient, text: '', statusText: 'ko', buttonText: 'Démarrer le diapo\'', dataSource: ds.cloneWithRows(['Dossiers de photos']), selectedFolder: '', buttonDisabled: true};

    this.state.server.listen(this.onMessageReceived)
    udpClient.findUdpServer("whois;");
  }

  toggleSlideshow() {
    if (this.state.statusText === 'ko') {
      this.state.client.sendUdpPacket("start;" + this.state.selectedFolder, this.getStatus());
      //this.setState({ statusText: 'ok'});
      this.setState({ buttonText: 'Arrêter le diapo\''});
    } else {
      this.state.client.sendUdpPacket("stop; ", this.getStatus())
      //this.setState({ statusText: 'ko'});
      this.setState({ buttonText: 'Démarrer le diapo\''});
    }
  }

  getStatus(err) {
    if (err) throw err
    //this.setState({statusText: "Le diapo tourne"});
    //self.updateChatter('a sent data')
  }

  onMessageReceived(message, rinfo) {
    let self = this;
    let action = message.split(';')[0];
    let param = message.split(';')[1];
    if (action === 'folders') {
      self.setState({dataSource: self.state.dataSource.cloneWithRows(JSON.parse(param))}); 
    } else if (action === 'slideshowstatus') {
        self.setState({statusText: param === 'True' ? "running" : "ko", buttonDisabled: param === 'True' ? false : true, buttonText: param === 'True' ? 'Arrêter le diapo\'' : 'Démarrer le diapo\''});
    } else if (action === 'iam') {
        self.state.client.setServerAddress(rinfo.address);
        self.state.client.sendUdpPacket("listfolders;");
        self.state.client.sendUdpPacket("getstatus;");
    } else {
      self.setState({statusText: param});
    }
  }

  componentDidMount() {

  }

  renderRow(rowData, sectionID, rowID, highlightRow: (sectionID: number, rowID: number) => void) {
    return (
      <TouchableHighlight onPress={() => {
        this.pressRow(rowID, rowData);
        highlightRow(sectionID, rowID);
      }}>
      <View>
      <View style={styles.row}>
      <Text style={styles.text}>
      {rowData[0]}
      </Text>
      <Text style={styles.photoNumber}>
      {rowData[1]}
      </Text>
      </View>
      </View>
      </TouchableHighlight>
    );
  }

  pressRow(rowID, rowData) {
    this.setState({buttonDisabled: false, selectedFolder: rowData[0]});
  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View
      key={`${sectionID}-${rowID}`}
      style={{
        height: adjacentRowHighlighted ? 2 : 1,
          backgroundColor: adjacentRowHighlighted ? '#00896c' : '#CCCCCC',
      }}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
      <StatusBar
      backgroundColor="blue"
      barStyle="dark-content"
      />
      <View style={styles.containerPicker}>
      <ListView
      dataSource={this.state.dataSource}
      renderRow={this.renderRow}
      renderSeparator={this.renderSeparator}
      /> 
      </View>

      <Button
      isDisabled={this.state.buttonDisabled}
      style={styles.button}
      textStyle={styles.textStyle}
      onPress={ () => this.toggleSlideshow()}
      accessibilityLabel="Lancer le diaporama"
      >{this.state.buttonText}
      </Button>
      <View style={styles.statusView}>
      <Text style={this.state.statusText === 'ok' ? styles.statusRunningText : styles.statusNotRunningText}>
      {this.state.statusText}
      </Text>
      </View>

      </View>
    );
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingLeft: 20,
    paddingRight: 20,
  },
  containerPicker: {
    flex: 8,
    flexDirection: 'row',
    marginTop: 40,
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
  },
  button: {
    flex: 1,
    borderColor: '#16a085',
    backgroundColor: '#1abc9c'
  },
  statusView: {
    flex: 1,
  },
  statusNotRunningText: {
    color: 'red',
  },
  statusRunningText: {
    color: 'green',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  text: {
    flex: 1,
    fontSize: 22,
  },
  photoNumber: {
    textAlign: "right",
    fontSize: 22,
  }
});

export default MainScreen;
