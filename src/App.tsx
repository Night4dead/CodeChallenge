import React, { useState } from "react";
type Args = { [argname: string]: boolean };
type Operation = { elements: (Operation | number | boolean)[], op: string };

let args = [{ "My arg": false } as Args];

function findArgName(args: Args): string {
  return Object.keys(args)[0];
}

function findArgValue(args: Args): boolean {
  return Object.values(args)[0];
}

const options = {
  CONSTANT: "constant",
  ARGUMENT: "argument",
  AND: "and",
  OR: "or",
  NOT: "not"
}

function evaluateOperation(operation: Operation): any {
  if (!operation.elements || !operation.op)
    return undefined;
  if (operation.op === options.CONSTANT)
    return operation.elements[0];
  if (operation.op === options.ARGUMENT)
    return findArgValue(args[operation.elements[0] as number]);
  if (operation.op === options.NOT)
    return !evaluateOperation(operation.elements[0] as Operation);
  if (operation.op === options.AND)
    return operation.elements.every((value: Operation | number | boolean) => evaluateOperation(value as Operation));
  if (operation.op === options.OR)
    return operation.elements.some((value: Operation | number | boolean) => evaluateOperation(value as Operation));
}

function OperationBuilder(props: {
  value: Operation;
  onChange: (value: Operation) => void;
}): JSX.Element {

  function reset() {
    props.onChange({} as Operation);
  }

  function changeOp(event: any) {
    let elements;
    if (event.target.value === options.ARGUMENT) {
      elements = [0];
      props.onChange({ ...props.value, elements: elements, op: event.target.value });
    } else if ((event.target.value === options.AND || event.target.value === options.OR) && !props.value.elements) {
      let op1 = {} as Operation;
      let op2 = {} as Operation;
      props.onChange({ ...props.value, elements: [op1, op2], op: event.target.value });
    } else if ((event.target.value === options.NOT) && !props.value.elements) {
      let op1 = {} as Operation;
      props.onChange({ ...props.value, elements: [op1], op: event.target.value });
    } else if ((event.target.value === options.CONSTANT) && !props.value.elements) {
      props.onChange({ ...props.value, elements: [false], op: event.target.value });
    } else
      props.onChange({ ...props.value, op: event.target.value });
  }

  function changeElement(event: any) {
    if (props.value.op === options.CONSTANT)
      props.onChange({ ...props.value, elements: [event.target.value === "true" ? true : false] });
    else
      props.onChange({ ...props.value, elements: [event.target.value] })
  }

  let select;

  if (!props.value.op) {
    select = <select onChange={changeOp}>
      <option selected disabled>select...</option>
      {Object.values(options).map((value, index) => (
        <option key={index} value={value}>{value}</option>
      ))}
    </select>;
  }

  if (props.value.op === options.CONSTANT) {
    select = <select onChange={changeElement}>
      <option value={"false"}>false</option>
      <option value={"true"}>true</option>
    </select>
  }

  if (props.value.op === options.ARGUMENT) {
    select = <select onChange={changeElement}>
      {args.map((value, index) => (
        <option key={index} value={index}>{findArgName(value)}</option>
      ))}
    </select>;
  }

  if(props.value.op === options.NOT){
    const [subElements, setSubElements] = useState([...props.value.elements]);

    return (
      <div>
        <div>
          <select defaultValue={props.value.op} onChange={changeOp}>
            <option value={options.NOT}>{options.NOT}</option>
          </select>
          <button type="button" onClick={reset}>X</button>
        </div>
        <div className="arguments">
          {subElements.map((value, index) => {

            const updateElement = (value: Operation) => {
              props.value.elements[index] = value;
              props.onChange({...props.value});
              setSubElements([...props.value.elements]);
            }

            return (
              <OperationBuilder key={index} value={value as Operation} onChange={updateElement} />
            )
          })}
        </div>
      </div>
    );
  }

  if (props.value.op === options.AND || props.value.op === options.OR) {
    const [subElements, setSubElements] = useState([...props.value.elements]);

    const addElement = () => {
      let op = {} as Operation;
      props.onChange({ ...props.value, elements: [...props.value.elements, op] });
      setSubElements([...subElements, op]);
    }

    return (
      <div>
        <div>
          <select defaultValue={props.value.op} onChange={changeOp}>
            <option value={options.AND}>{options.AND}</option>
            <option value={options.OR}>{options.OR}</option>
          </select>
          <button type="button" onClick={reset}>X</button>
        </div>
        <div className="arguments">
          {subElements.map((value, index) => {

            const updateElement = (value: Operation) => {
              props.value.elements[index] = value;
              props.onChange({...props.value});
              setSubElements([...props.value.elements]);
            }

            return (
              <OperationBuilder key={index} value={value as Operation} onChange={updateElement} />
            )
          })}
          <button type="button" onClick={addElement}>add op</button>
        </div>
      </div>
    );
  }

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
  const value: boolean = findArgValue(props.value);
  const name: string = findArgName(props.value);

  function updateName(event: any) {
    let newName = event.target.value;
    props.onChange({ [newName]: value });
  }

  function updateValue(event: any) {
    let newValue: boolean = event.target.value === "true" ? true : false;
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
  const [, setArgs] = useState();
  const [operation, setOperation] = useState({} as Operation);

  function updateArgs(index: number, value: Args) {
    args[index] = value;
    setArgs({} as any);
  }

  function addArg() {
    args.push({ "newargs": false });
    setArgs({} as any);
  }

  return (
    <div>
      {args.map((element, index) => (
        <ArgItem value={element} onChange={(value) => updateArgs(index, value)} key={index} />
      ))}
      <button className="argsplus" type="button" onClick={addArg}>add args</button>
      <OperationBuilder value={operation} onChange={value => setOperation(value)} />
      <p>Result : {String(evaluateOperation(operation))}</p>
    </div>
  );
}