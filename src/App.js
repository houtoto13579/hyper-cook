import React, { Component } from 'react';
import './App.css';
import Fridge from './Fridge.js';
import Recipe from './Recipe.js';
import './rccalendar.css';
import deleteIcon from './delete.png';
import addIcon from './add.png';
import SweetAlert from 'react-bootstrap-sweetalert';
import Calendar from 'rc-calendar';
import DatePicker from 'rc-calendar/lib/Picker';
import zhCN from 'rc-calendar/lib/locale/zh_CN';
import enUS from 'rc-calendar/lib/locale/en_US';
import './rc.css';
import TimePickerPanel from 'rc-time-picker/lib/Panel';

import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';

class App extends Component {
  constructor(){
    super();
    this.state={
      fridge:[
        {id:0, name: "pork", day:3, chosen: false},
        {id:1, name: "egg", day:7, chosen: false},
        {id:2, name: "tomato", day:2, chosen: false},
        {id:3, name: "cheese", day:1, chosen: false}
      ],
      deletemode: false,
      queue:[
        {}
      ],
      recipeList:[],
      count:4,
      alert: null,
      newDay: 0,
      newName: "New",
    }
    this.intoQueue=this.intoQueue.bind(this);
    this.fetchRecipe=this.fetchRecipe.bind(this);
    this.addFridge=this.addFridge.bind(this);
    this.deleteSwitch=this.deleteSwitch.bind(this);
    this.deleteFridge=this.deleteFridge.bind(this);
    this.apiUrl="https://recipe-finder-2017.herokuapp.com/api/";

    this.onRecieveName=this.onRecieveName.bind(this);
    this.onRecieveDate=this.onRecieveDate.bind(this);
    this.onStandaloneSelect=this.onStandaloneSelect.bind(this);
    this.hideAlert=this.hideAlert.bind(this);
  }
  findTarget(array, id){
    for (let i = 0, l = array.length; i < l; i++)
      if (array[i].id === id)
          return i;
  }
  findTargetName(array, name){
    for (let i = 0, l = array.length; i < l; i++)
      if (array[i].name === name)
          return i;
  }
  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }
  fetchRecipe(){
    let queue=this.state.queue;
    let recipeList = [];
    fetch(`${this.apiUrl}ingredient`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "ingredient":queue
      }),
    }).then(this.checkStatus)
    .then(response=>response.json())
    .then(resObj=>{
      recipeList=resObj.recipe;
      this.setState({
        recipeList,
      })
    })
    .catch(error=>{
        console.log('get list fail...')
        console.log(error);
        this.setState({
          recipeList: []
      })
    });
  }
  intoQueue(id,name,chosen){
    let fridge = this.state.fridge;
    let queue = [];
    let target = this.findTarget(fridge, id);
    fridge[target].chosen=!chosen;
    for(let i=0; i<fridge.length; i++){
      if(fridge[i].chosen){
        queue.push(fridge[i].name);
      }
    }
    this.setState({fridge,queue,},()=>{this.fetchRecipe()})
  }
  addFridge(){
    
    this.setState({
    alert:(<SweetAlert
          input
          showCancel
          title="Ingredient"
          required
          validationMsg="You must enter your ingredient!"
          onConfirm={this.onRecieveName}
          onCancel={this.hideAlert}
      />)})
  }
  onStandaloneSelect(value) {
    const now = moment();
    const format = 'YYYY-MM-DD';
    now.locale('zh-cn').utcOffset(8);
    console.log('onStandaloneSelect');
    console.log(value && value.format(format));
    var duration = moment.duration(value.diff(now));
    var newDay = Math.ceil(duration.asDays());
    this.setState({newDay,})
  }
  onRecieveName(value){
    const format = 'YYYY-MM-DD';
    const now = moment();
    now.locale('zh-cn').utcOffset(8);
    function getFormat(time) {
      return time ? format : 'YYYY-MM-DD';
    }
    const timePickerElement = <TimePickerPanel defaultValue={moment('00:00:00', 'HH:mm:ss')} />;
    function disabledDate(current) {
      if (!current) {
        // allow empty select
        return false;
      }
      const date = moment();
      date.hour(0);
      date.minute(0);
      date.second(0);
      return current.valueOf() < date.valueOf();  // can not select days before today
    } 
    this.setState({
      newName:value,
    alert:(<SweetAlert
          showCancel
          custom
          title="Expired date"
          onConfirm={this.onRecieveDate}
          onCancel={this.hideAlert}
      ><div className="calendar-div">
        <Calendar
          showWeekNumber={false}
          locale={enUS}
          defaultValue={now}
          showToday
          formatter={getFormat(true)}
          showOk={false}
          timePicker={timePickerElement}
          onSelect={this.onStandaloneSelect}
          disabledDate={disabledDate}
        />
      </div>

      
      </SweetAlert>)})
    
  }
  onRecieveDate(){
    let fridge=this.state.fridge;
    let newFood={
      id: this.state.count,
      name: this.state.newName,
      day: this.state.newDay,
      chosen: false,
    }
    fridge.push(newFood);
    this.setState(
      {
        fridge,
        count:this.state.count+1,
        alert:(<SweetAlert
          success
          title="Finish"
          onConfirm={this.hideAlert}
        />)
      }
    )
  }
  hideAlert(){
    this.setState({alert:null})
  }
  deleteSwitch(){
    this.setState({deletemode:!this.state.deletemode})
  }
  deleteFridge(id){
    let fridge = this.state.fridge;
    let queue = this.state.queue;
    let target = this.findTarget(fridge, id);
    if (fridge[target].chosen===true){
      let queueTarget = this.findTargetName(queue, fridge.name);
      queue.splice(queueTarget,1);
    }
    fridge.splice(target,1);
    this.setState({fridge,queue,},()=>{this.fetchRecipe()})
  }
  render() {
    return (
      <div className="App">        
        {this.state.alert}
        <div className="App-header">
          <h2>HyperCook</h2>
        </div>
        <div className="main-body">
          <div className="fridge">
            <div>
              <img className="icon" src={addIcon} alt="add" onClick={this.addFridge}/>
              <img className="icon" src={deleteIcon} onClick={this.deleteSwitch} alt="delete"/>
              <Fridge 
                fridge={this.state.fridge}
                deletemode={this.state.deletemode}
                intoQueue={this.intoQueue}
                deleteFridge={this.deleteFridge}
                >

              </Fridge>
            </div>
          </div>
          <div className="recipe">
            <Recipe
              recipe={this.state.recipeList}
            />
          </div>
        </div>
      </div>
    );
  }
}


export default App;
