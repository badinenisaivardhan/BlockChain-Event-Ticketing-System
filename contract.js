const { Web3 } = require('web3');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const WEB_URL = process.env.WEB_URL;
const web3 = new Web3(WEB_URL);

//Connect To Contract
const contractABI = 
[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "organiserAddress",
				"type": "address"
			}
		],
		"name": "addOrganiser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "cancelEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_ticketHolder",
				"type": "address"
			}
		],
		"name": "cancelTicket",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "eventName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "eventTicketPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "eventTotalTickets",
				"type": "uint256"
			}
		],
		"name": "createEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "newName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "newTicketPrice",
				"type": "uint256"
			}
		],
		"name": "editEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ticketQuantity",
				"type": "uint256"
			}
		],
		"name": "purchaseTicket",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "EventCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "eventName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "organiser",
				"type": "address"
			}
		],
		"name": "EventCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newTicketPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum WorkingContract.EventStatus",
				"name": "newStatus",
				"type": "uint8"
			}
		],
		"name": "EventUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "eventowner",
				"type": "address"
			}
		],
		"name": "NothingForWithdrawl",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "RefundAlreadyCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "refundAmount",
				"type": "uint256"
			}
		],
		"name": "RefundProcessed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "startSellingTickets",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "stopSellingTickets",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ticketQuantity",
				"type": "uint256"
			}
		],
		"name": "TicketPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "eventowner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "withdrawable_amount",
				"type": "uint256"
			}
		],
		"name": "WithdrawComplete",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "withdrawEventTicketMoney",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "events",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "eventName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "eventOrganiser",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "eventTicketPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "eventTotalTickets",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "eventAvailableTickets",
				"type": "uint256"
			},
			{
				"internalType": "enum WorkingContract.EventStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLatestEventId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ticketHolder",
				"type": "address"
			}
		],
		"name": "getMyEventList",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "getTicketHolder",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "ticketBuyer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "purchasedTickets",
						"type": "uint256"
					}
				],
				"internalType": "struct WorkingContract.TicketHolder[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "getTicketQuantity",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isAdmin",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isEventOrgraniser",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "listAllEventId",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const contractAddress = CONTRACT_ADDRESS; 
const contract = new web3.eth.Contract(contractABI, contractAddress);
const contractMethods = contract.methods

function convertBigIntsToNumbers(obj) {
    if (typeof obj === 'bigint') {
        return Number(obj);
    } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = convertBigIntsToNumbers(obj[key]);
            }
        }
    }
    return obj;
}



const isAdmin =async (address)=>{
    let flag = await contractMethods.isAdmin(address).call();
    return convertBigIntsToNumbers(flag);
}

const isEventOrgraniser = async (address) =>{
    let flag = await contractMethods.isEventOrgraniser(address).call();
    return convertBigIntsToNumbers(flag);
}

const eventDetails = async(eventId)=>{
    let eventDetails = await contractMethods.events(eventId).call();
    let convertedvalues = convertBigIntsToNumbers(eventDetails);
    const stringObject = Object.fromEntries(
        Object.entries(convertedvalues).map(([key, value]) => [key, typeof value === 'string' ? String(value) : value])
      );
      
    return stringObject
}

const getMyEventList = async (address)=>{
    let myEventList = await contractMethods.getMyEventList(address).call();
    return convertBigIntsToNumbers(myEventList);
}

const getTicketHolder = async(eventId,userAddress) =>{
    let TicketHoldersList  = await contractMethods.getTicketHolder(eventId).call({from:userAddress});
    return convertBigIntsToNumbers(TicketHoldersList)
}

const getTicketQuantity = async(eventId,userAddress) =>{
    let getTicketQty  = await contractMethods.getTicketQuantity(eventId,userAddress).call();
    return convertBigIntsToNumbers(getTicketQty)
}

const getLatestEventId = async()=>{
    let eventId = await contractMethods.getLatestEventId().call();
    return convertBigIntsToNumbers(eventId);
}

const listAllEventId = async()=>{
    let evendIdList = await contractMethods.listAllEventId().call();
    return convertBigIntsToNumbers(evendIdList);
}


module.exports = {
    isAdmin,
    isEventOrgraniser,
    eventDetails,
    getMyEventList,
    getTicketHolder,
    getTicketQuantity,
    getLatestEventId,
    listAllEventId
}