
import './App.css';
import {useState,useRef,useEffect} from "react";
import Web3 from "web3";
import contractAbi from "./abi.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const contractAddress="0xAfc6a120554E6Defa765eB48d4C463bEe10d9D7d";
  const rpcUrl="https://polygon-rpc.com/"
  const [nftPrice,setNFTPrice]=useState(0);
  const [mweb3,setMweb3]=useState();
  const [mintData,setMintData]=useState();
  const [walletAddress,setWallet]=useState();
  const [loading,setLoading]=useState(false);
  const [amountToMint,setAmount]=useState(1);
  const [currentGas,setCG]=useState(100000000000);
  const amountInput=useRef();

  const getGas=async()=>{
    const req=await fetch("https://gasstation-mainnet.matic.network");
    const data=await req.json();
    setCG(data?.fastest);
  }

  useEffect(async()=>{
    const web3 = new Web3(rpcUrl);
    const contract = new web3.eth.Contract(contractAbi,contractAddress);
    const totalMint=await contract.methods.totalSupply().call();
    const maxMint=await contract.methods.maxSupply().call();
    await getPrice();
    await getGas();
    setMintData({
      totalMint,
      maxMint
    });
  },[])

  const changeNetwork = async () => {
  
      try {
        await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
          params: [{ chainId: Web3.utils.toHex("137") }],
        });
     
      } catch (err) {
        
      }
    }
   

  const getPrice=async()=>{
    const web3 = new Web3(rpcUrl);
    const contract = new web3.eth.Contract(contractAbi,contractAddress);
    const nftPrice=await contract.methods.cost().call();
    setNFTPrice(Web3.utils.fromWei(nftPrice,"ether"));
  }


  const walletConnect=async()=>{
    const address = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    await changeNetwork();
    const provider = window.ethereum;
    const web3 = new Web3(provider);
    setMweb3(web3);
    setWallet(address[0]);
  }

  const mintHandler=async()=>{
    try{
      setLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const contract = new mweb3.eth.Contract(contractAbi,contractAddress);
      const tx=await contract.methods.mint(amountToMint).send({from:walletAddress,value:amountToMint*Web3.utils.toWei(nftPrice, 'ether'),gasPrice:parseFloat(currentGas)*1000000000+10000000000});
      setLoading(false);
      if(tx){
        toast.success('🦄 NFT minted successfully.', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
          setMintData({
            ...mintData,
            totalMint:parseInt(mintData.totalMint)+parseInt(amountToMint),
          });
      }
      else{
        toast.error('Someting went wrong.', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
      }
    }
    catch(err){
      toast.error("Someting went wrong.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
        setLoading(false);
    }


  }
  return (
    <div className="container-fluid main-screen">
      <ToastContainer />
    <div className="container">
      {!walletAddress?<div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6 text-center">
          <h2>Please Connect</h2>
          <h4>Connect to the network (Accepted Wallet: Metamask).</h4>
          <a onClick={walletConnect} className="btn main-btn mb-2">CONNECT</a>
          <h3>Price : {nftPrice} MATIC</h3>
        </div>
        <div className="col-md-3"></div>
      </div>:<><div className="row">
					<div className="col-md-3"></div>
					<div className="col-md-6 text-center">
						<h2>AVAILABLE</h2>
						<a className="btn main-btn mint">{mintData&&`${mintData?.totalMint}/${mintData?.maxMint}`}</a>
						<div className="input-groups">
						  	<button onClick={()=>{amountToMint>1&&setAmount(amountToMint-1)}} className="quantity-field me-1">-</button>
						  	<input value={amountToMint} type="number" name="quantity" className="quantity-field" ref={amountInput}/>
						  	<button onClick={()=>{amountToMint<mintData?.maxMint&&setAmount(amountToMint+1)}} className="quantity-field ms-1">+</button>
						</div>
						<a onClick={mintHandler} className="btn main-btn mint mb-2">{loading?<div class="spinner-border" role="status"></div>:"MINT"}</a>
						<h3>Price : {nftPrice} MATIC</h3>
					</div>
					<div className="col-md-3"></div>


        


				</div>
        
        


      </>
        }
    </div>
  </div>
  );
}

export default App;
