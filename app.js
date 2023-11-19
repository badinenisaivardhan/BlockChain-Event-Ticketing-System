const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');;
const cors = require('cors');
const app = express();
const { Web3 } = require('web3');
require('dotenv').config()
const secretKey = process.env.SESSION_SECRET;
const OwnerAddress= process.env.OWNER_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS
const { verifySignature } = require('./middleware/Web3_Middleware');
const { generateToken, addAuthorization } = require('./middleware/JWT_Middleware');
const { isAdmin, isEventOrgraniser, listAllEventId, eventDetails, getLatestEventId, getTicketHolder, getMyEventList, getTicketQuantity } = require('./contract');

app.use(express.static('public'))

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));
app.use(cors())
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));


app.post('/isEventOrgraniser',async(req,res)=>{
	let flag = await isEventOrgraniser(req.body.userAddress);
	res.send({
		status:"Success",
		data:flag
	})
})

app.get('/listAllEventId',async(req,res)=>{
	let eventList = await listAllEventId();
	res.send({
		contract:contractAddress,
		status:"Success",
		data:eventList
	})
})

app.get('/getLatestEventId',async(req,res)=>{
	let eventList = await getLatestEventId();
	res.send({
		contract:contractAddress,
		status:"Success",
		data:eventList
	})
})


app.post('/eventDetails',async(req,res)=>{
	let eventDetailsList = await eventDetails(req.body.eventId);
	res.send({
		contract:contractAddress,
		status:"Success",
		data:eventDetailsList
	})
})

app.post('/getMyEventList',async(req,res)=>{
	let eventDetailsList = await getMyEventList(req.body.userAddress);
	res.send({
		contract:contractAddress,
		status:"Success",
		data:eventDetailsList
	})
})


app.post('/getTicketHolder',async(req,res)=>{
	let TicketHolderList = await getTicketHolder(req.body.eventId,req.body.userAddress);
	res.send({
		contract:contractAddress,
		status:"Success",
		data:TicketHolderList
	})
})


app.post('/getTicketQuantity',async(req,res)=>{
	let TicketQty = await getTicketQuantity(req.body.eventId,req.body.userAddress)
	res.send({
		contract:contractAddress,
		status:"Success",
		data:TicketQty
	})
})

app.get('/',(req,res)=>{
    if (req.session.userAddress && req.session.token){
        res.redirect('/dashboard')
    }else{
        req.session.destroy()
        res.render('index')
    }
})


app.get('/login',(req,res)=>{
    if( req.session.userAddress && req.session.token){
        res.redirect('/dashboard')
    }else{
        req.session.destroy()
        res.redirect('/')
    }
})

app.post('/login', async (req, res) => {
    const { message, signature, userAddress } = req.body;
    const isValidSignature = verifySignature(message, signature, userAddress);
    if (isValidSignature) {
        let token = generateToken(userAddress);
        req.session.userAddress = userAddress
        req.session.token = token
        res.redirect('/dashboard')
    } else {
        req.session.destroy()
        res.status(401).json({ status: false, message: 'InValid Signature' });
    }
});

app.get('/dashboard',addAuthorization,verifyToken,async (req,res)=>{
    token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/dashboard',{status: true, message: 'Valid Signature', token, userAddress})
	}
	else if(isEventOrgraniserFlag){
		res.render('organiser/dashboard',{status: true, message: 'Valid Signature', token, userAddress})
	}
	else{
		res.render('user/dashboard',{status: true, message: 'Valid Signature', token, userAddress})
	}
})

app.get('/dashboard/addorganiser',addAuthorization,verifyToken,async(req,res)=>{
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/addorganiser',{status: true, message: 'Valid Signature', token, userAddress})
	}else{
		res.redirect('/dashboard')
	}
})

app.get('/dashboard/newevent',addAuthorization,verifyToken,async(req,res)=>{
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/newevent',{status: true, message: 'Valid Signature', token, userAddress})
	}else if(isEventOrgraniserFlag){
		res.render('organiser/newevent',{status: true, message: 'Valid Signature', token, userAddress})
	}
})

app.get('/dashboard/myevents',addAuthorization,verifyToken,async(req,res)=>{
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/myevents',{status: true, message: 'Valid Signature', token, userAddress})
	}else if(isEventOrgraniserFlag){
		res.render('organiser/myevents',{status: true, message: 'Valid Signature', token, userAddress})
	}else{
		res.render('user/myevents',{status: true, message: 'Valid Signature', token, userAddress})
	}
})

app.get('/editEvent/:id',addAuthorization,verifyToken,async(req,res)=>{
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	let details = await eventDetails(req.params.id)
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/editevent',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}else if(isEventOrgraniserFlag){
		res.render('organiser/editevent',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}
	
})


app.get('/cancelEvent/:id',addAuthorization,verifyToken,async(req,res)=>{
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	let details = await eventDetails(req.params.id)
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/cancelevent',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}else if(isEventOrgraniserFlag){
		res.render('organiser/cancelevent',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}
})


app.get('/buyTicket/:id',addAuthorization,verifyToken,async(req,res)=>{
	let details = await eventDetails(req.params.id)
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/buyticket',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}else if(isEventOrgraniserFlag){
		res.render('organiser/buyticket',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}else{
		res.render('user/buyticket',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}
})

app.get('/cancelTicket/:id',addAuthorization,verifyToken,async(req,res)=>{
	token = req.session.token
    userAddress = req.session.userAddress
	let isAdminFlag = await isAdmin(userAddress);
	let isEventOrgraniserFlag = await isEventOrgraniser(userAddress);
	let details = await eventDetails(req.params.id)
	if(isAdminFlag || (isAdminFlag && isEventOrgraniserFlag)){
		res.render('admin/cancelticket',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}else if(isEventOrgraniserFlag){
		res.render('organiser/cancelticket',{status: true, message: 'Valid Signature', token, userAddress,eventId:req.params.id,details:details})
	}
	
})

app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
