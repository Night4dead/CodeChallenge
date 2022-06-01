import React, { useState } from "react";
type Args = { [argname: string]: boolean };
type Operation = { args: (Operation | Args | boolean)[], op: string }; /* ...todo:
a system for defining logical operations 
(not, and, or... more if you want) that can be passed:
 - selected args by name: (X and Y)
 - constant values not dependent on args: (true and X)
 - other operations: ((X and Y) or Z) 
 */

function evaluateOperation(operation: Operation, args: Args): any {
  /* ...todo: implement an evaluator for your operations, 
  given some args */
  if (!operation.args)
    return undefined;
  if (operation.op === "or")
    return operation.args.some((value) => { return evaluateOperation(value as Operation, {}) });
  if (operation.op === "and")
    return operation.args.every((value) => { return evaluateOperation(value as Operation, {}) });
  if (operation.op === "argument")
    return Object.values(operation.args[0])[0];
  if (operation.op === "constant")
    return operation.args[0] as boolean;
  return undefined;
}

function OperationBuilder(props: {
  args: Args[],
  value: Operation;
  onChange: (value: Operation) => void;
}): JSX.Element {

  function changeOp(event: any) {
    let op = { ...props.value, op: event.target.value } as Operation;
    if (op.op === "constant")
      op.args = [false];
    if (op.op === "argument")
      op.args = [props.args[0]];
    props.onChange(op);
  }

  function changeArgs(args: (Operation | Args | boolean)[]) {
    let op = { ...props.value, args: args } as Operation;
    props.onChange(op);
  }

  function reset() {
    props.onChange({} as Operation);
  }

  const options = [
    "constant",
    "argument",
    "and",
    "or"
  ]

  let select;

  if (props.value.op === "constant") {
    select = <select onChange={event => changeArgs([event.target.value === "true" ? true : false])}>
      <option value={"false"}>false</option>
      <option value={"true"}>true</option>
    </select>;
  }

  if (props.value.op === "argument") {
    select = <select>
      {props.args.map((value, index) => {
        const name: string = Object.keys(value)[0];
        return (
          <option key={index} value={name}>{name}</option>
        )
      })}
    </select>;
  }

  if (props.value.op === "and" || props.value.op === "or") {

    const [operation1, setOperation1] = useState({} as Operation);
    const [operation2, setOperation2] = useState({} as Operation);
    //props.onChange({...props.value, args: [operation1,operation2] });
    return <div>
      <div>
        <select onChange={(event) => changeOp(event)} defaultValue={props.value.op}>
          <option selected disabled>select...</option>
          {options.map((value, index) => (
            <option key={index} value={value}>{value}</option>
          ))}
        </select>
        <button type="button" onClick={reset}>X</button>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <OperationBuilder args={props.args} value={ operation1 } onChange={value => setOperation1(value)}/>
        <OperationBuilder args={props.args} value={ operation2 } onChange={value => setOperation2(value)}/>
      </div>
    </div>
  }

  if (!props.value.op)
    select = <select onChange={(event) => changeOp(event)}>
      <option selected disabled>select...</option>
      {options.map((value, index) => (
        <option key={index} value={value}>{value}</option>
      ))}
    </select>;

  return (
    <div>
      {select}
      <button type="button" onClick={reset}>X</button>
    </div>
  )
}

function ArgItem(props: {
  value: Args;
  key: number;
  onChange: (value: Args) => void;
}): JSX.Element {
  const value: boolean = Object.values(props.value)[0];
  const name: string = Object.keys(props.value)[0];

  function updateName(event: any) {
    let newName = event.target.value;
    props.onChange({ [newName]: value });
  }

  function updateValue(event: any) {
    let newValue = event.target.value as boolean;
    props.onChange({ [name]: newValue })
  }

  return (
    <div>
      <input defaultValue={name} onChange={updateName} />
      <select onChange={updateValue}>
        <option value={"false"}>false</option>
        <option value={"true"}>true</option>
      </select>
    </div>
  );
}

export default function App() {

  const [args, setArgs] = useState([{ "My arg": false } as Args]);

  const [operation, setOperation] = useState({} as Operation);

  function updateArgs(index: number, value: Args) {
    let argsNew = [...args];
    argsNew[index] = value;
    setArgs(argsNew);
  }

  function addArg() {
    let argsNew = [...args, { "newargs": false }];
    setArgs(argsNew);
  }

  return (
    <div>
      {args.map((element, index) => (
        <ArgItem value={element} onChange={(value) => updateArgs(index, value)} key={index} />
      ))}
      <button type="button" onClick={addArg}>add args</button>
      <OperationBuilder args={args} value={operation} onChange={value => setOperation(value)} />
      <p>Result : {String(evaluateOperation(operation, {}))}</p>
      {args.map((value, index) =>
        <p key={index}>{String(Object.keys(value)[0])} : {String(Object.values(value)[0])}</p>
      )}
    </div>
  );
}