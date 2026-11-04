import { useState, useEffect } from "react";
import { Button, Table, Form, Container, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import SimpleMathContract from "./contracts/SimpleMath.sol/SimpleMath.json";
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // ที่อยู่ของ smart contract หลัง deploy
const WEB3_URL = "ws://127.0.0.1:8545";

function App() {
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);
  const [firstOperand, setFirstOperand] = useState("");
  const [secondOperand, setSecondOperand] = useState("");
  const [contract, setContract] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    let providerInstance;
    if (window.ethereum) { 
      providerInstance = new ethers.BrowserProvider(window.ethereum);
    } else {
      providerInstance = new ethers.WebSocketProvider(WEB3_URL);
    }
    setProvider(providerInstance);
    console.log("Provider set:", providerInstance);
  }, []);

  //connectWallet สร้างฟังก์ชัน connectWallet เชื่อมกับกระเป๋าเงินของUserและInstanceของ smart contract ใช้ ethers.js
  const connectWallet = async () => {
      try {
        const signerInstance = await provider.getSigner();
        console.log("Owner address", await signerInstance.getAddress());
        console.log("contract address", contractAddress);
        console.log("abi", SimpleMathContract.abi);
        const sm = new ethers.Contract(contractAddress, SimpleMathContract.abi, signerInstance);
        console.log("contract", sm);
        setConnected(true);
        setContract(sm);
      } catch (e) {
        console.error(e);
      }
    };
  const handleCalculation = async operator => {
    try {
      console.log("First Operand:", firstOperand);
      console.log("Second Operand:", secondOperand);
      console.log(operator);
      setFirstOperand("");
      setSecondOperand("");
      let num1 = parseInt(firstOperand);
      let num2 = parseInt(secondOperand);
      let res;
      let sign = "";

      if (!connected || !contract) {
        res = "Please connect your wallet first.";
        return;
      } 
      if (isNaN(num1) || isNaN(num2)) {
        res = "Please enter valid numbers.";
        return;
      }
      switch (operator) {
        case "add": await contract.add(num1, num2); 
          res = num1 + num2;
          sign = "+";
          break;
        case "subtract": await contract.subtract(num1, num2); 
          res = num1 - num2;
          if (res < 0) {
            sign = "-";
            res = Math.abs(res); 
          }
          break;
        case "multiply": await contract.multiply(num1, num2); 
          res = num1 * num2; 
          sign = "+"; 
          break;
        case "divide": await contract.divide(num1, num2); 
          if (num2 === 0) {
            res = "Cannot divide by zero.";
          }
          else {
            res = num1 / num2;
            sign = "+";}
          break;
        default:
          res = "Invalid operator.";
          break;
      }
      res = res !== null ? (sign === "-" ? "-" : "") + res.toString() : "Not Available";
      setResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container fluid style={{ width: "80%", marginTop: "20px" }}>
      <Button
        variant={connected ? "primary" : "secondary"}
        className="m-3"
        onClick={connectWallet}
      >
        {connected ? "Connected" : "Connect"}
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th className="text-center">#</th>
            <th className="text-center" colSpan={"2"}>
              First Operand
            </th>
            <th className="text-center" colSpan={"2"}>
              Second Operand
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center">Input</td>
            <td colSpan={"2"}>
              <Form.Control
                type="number"
                name="firstOperand"
                value={firstOperand}
                onChange={e => setFirstOperand(e.target.value)}
              /> 
            </td>
            <td colSpan={"2"}>
              <Form.Control
                type="number"
                name="secondOperand"
                value={secondOperand}
                onChange={e => setSecondOperand(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td className="text-center">Operator</td>
            <td>
              <Button
                variant="success"
                className="w-100"
                onClick={() => handleCalculation("add")}
              >
                Add
              </Button>
            </td>
            <td>
              <Button
                variant="danger"
                className="w-100"
                onClick={() => handleCalculation("subtract")}
              >
                Subtract
              </Button>
            </td>
            <td>
              <Button
                variant="warning"
                className="w-100"
                onClick={() => handleCalculation("multiply")}
              >
                Multiply
              </Button>
            </td>
            <td>
              <Button
                variant="info"
                className="w-100"
                onClick={() => handleCalculation("divide")}
              >
                Divide
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Result Card */}
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Calculation Result : {result}</Card.Title>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;
