// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicketingSystem {
    address internal owner;
    uint256 internal eventIdCounter;
    uint256[] internal eventIdlist ;

    enum EventStatus { NotStarted, Started, Cancelled }

    struct TicketHolder {
        address ticketBuyer;
        uint256 purchasedTickets;
    }

    struct Event {
        uint256 eventId;
        string eventName;
        address eventOrganiser;
        uint256 eventTicketPrice;
        uint256 eventTotalTickets;
        uint256 eventAvailableTickets;
        EventStatus status;
        TicketHolder[] ticketsBought;
    }

    mapping(address => uint256[]) eventsList;
    mapping(uint256 => Event) public events;
    mapping(address => bool) internal eventOrganisers;

    event EventCreated(uint256 eventId, string eventName, address organiser);
    event EventUpdated(uint256 eventId, string newName, uint256 newTicketPrice, EventStatus newStatus);
    event EventCancelled(uint256 eventId);
    event TicketPurchased(uint256 eventId, address buyer, uint256 ticketQuantity);
    event RefundProcessed(uint256 eventId, address buyer, uint256 refundAmount);
    event RefundAlreadyCompleted(uint256 eventId, address buyer);
    event WithdrawComplete(uint256 eventId, address eventowner, uint256 withdrawable_amount);
    event NothingForWithdrawl(uint256 eventId, address eventowner);


    modifier onlyAdminOrOrganiser(uint256 eventId) {
        require(((msg.sender == owner) || (eventOrganisers[msg.sender])), "Only Admin/Event Organisers can perform this action");
        require(((msg.sender == owner) || (events[eventId].eventOrganiser == msg.sender)), "Admin Or Event Organiser Who Own The Event Can Only Modify Events");
        _;
    }

    modifier checkEventTicketBuyer(uint256 eventId, address _ticketHolder) {
        bool ticketBought = false;
        for (uint256 i = 0; i < events[eventId].ticketsBought.length; i++) {
            if (events[eventId].ticketsBought[i].ticketBuyer == _ticketHolder) {
                ticketBought = true;
                break;
            }
        }
        require(ticketBought, "You Can Only Cancel The Ticket You Purchased For The Event");
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(events[eventId].eventId != 0, "Event Does Not Exist");
        _;
    }

    modifier ticketsAvailable(uint256 eventId, uint256 ticketQuantity) {
        require(events[eventId].eventAvailableTickets >= ticketQuantity, "Not Enough Tickets Available For The Event");
        _;
    }


    modifier eventNotStartedOrCancelled(uint256 eventId) {
        require(events[eventId].status != EventStatus.NotStarted,"Event Ticket Sale Not Started");
        require(events[eventId].status != EventStatus.Cancelled,"Event Cancelled");
        _;
    }

    constructor() {
        owner = msg.sender;
        eventIdCounter = 1;
    }

    function addOrganiser(address organiserAddress) external  {
        require(msg.sender == owner,"Only Admin Can Add Organisers can perform this action");
        eventOrganisers[organiserAddress] = true;
    }

    function createEvent(
        uint256 eventId,
        string memory eventName,
        uint256 eventTicketPrice,
        uint256 eventTotalTickets
    ) external {
        require(events[eventId].eventId == 0, "Event with this ID already exists");
        Event storage newEvent = events[eventId];
        newEvent.eventId = eventId;
        newEvent.eventName = eventName;
        newEvent.eventOrganiser = msg.sender;
        newEvent.eventTicketPrice = eventTicketPrice;
        newEvent.eventTotalTickets = eventTotalTickets;
        newEvent.eventAvailableTickets = eventTotalTickets;
        newEvent.status = EventStatus.NotStarted;
        eventIdlist.push(eventId);
        eventIdCounter++;
        emit EventCreated(eventId, eventName, msg.sender);
    }

    function editEvent(
        uint256 eventId,
        string memory newName,
        uint256 newTicketPrice
    ) external onlyAdminOrOrganiser(eventId) {
        Event storage currentEvent = events[eventId];
        currentEvent.eventName = newName;
        currentEvent.eventTicketPrice = newTicketPrice;
        emit EventUpdated(eventId, newName, newTicketPrice,currentEvent.status);
    }

    function cancelEvent(uint256 eventId) external onlyAdminOrOrganiser(eventId) {
        Event storage currentEvent = events[eventId];
        require(currentEvent.status != EventStatus.Cancelled, "Event is already cancelled");
        currentEvent.status = EventStatus.Cancelled;
        emit EventCancelled(eventId);

        // Refund all purchased tickets
        for (uint256 i = 0; i < currentEvent.ticketsBought.length; i++) {
            TicketHolder storage ticketHolder = currentEvent.ticketsBought[i];
            address payable ticketBuyer = payable(ticketHolder.ticketBuyer);
            uint256 refundAmount = currentEvent.eventTicketPrice * ticketHolder.purchasedTickets ;
            // Check if the buyer has purchased tickets
            if (ticketHolder.purchasedTickets > 0) {
                // Refund the buyer
                payable(ticketBuyer).transfer(refundAmount);
                currentEvent.eventAvailableTickets += ticketHolder.purchasedTickets;
                ticketHolder.purchasedTickets = 0;
                emit RefundProcessed(eventId, ticketBuyer, refundAmount);
            }
        }
    }

    function startSellingTickets(uint256 eventId) external onlyAdminOrOrganiser(eventId) {
        events[eventId].status = EventStatus.Started;
        emit EventUpdated(eventId, events[eventId].eventName, events[eventId].eventTicketPrice, EventStatus.Started);
    }

    function stopSellingTickets(uint256 eventId) external onlyAdminOrOrganiser(eventId) {
        events[eventId].status = EventStatus.NotStarted;
        emit EventUpdated(eventId, events[eventId].eventName, events[eventId].eventTicketPrice, EventStatus.NotStarted);
    }

    function existingBuyer(uint256 eventId, uint256 ticketQuantity) internal returns (bool) {
        Event storage currentEvent = events[eventId];
        for (uint256 i = 0; i < currentEvent.ticketsBought.length; i++) {
            if (currentEvent.ticketsBought[i].ticketBuyer == msg.sender) {
                currentEvent.ticketsBought[i].purchasedTickets += ticketQuantity;
                emit TicketPurchased(eventId, msg.sender, ticketQuantity);
                return true;
            }
        }
        return false;
    }

    function purchaseTicket(uint256 eventId, uint256 ticketQuantity) external payable
    eventExists(eventId)
    ticketsAvailable(eventId, ticketQuantity)
    eventNotStartedOrCancelled(eventId)
    {
        Event storage currentEvent = events[eventId];
        uint256 totalCost = currentEvent.eventTicketPrice * ticketQuantity ;
        require(msg.value >= totalCost , "Insufficient funds sent");
        currentEvent.eventAvailableTickets -= ticketQuantity;
        bool existingBuyerCheck = existingBuyer(eventId, ticketQuantity);
        if (!existingBuyerCheck) {
            TicketHolder memory newTicket = TicketHolder({
                ticketBuyer: msg.sender,
                purchasedTickets: ticketQuantity
            });
            currentEvent.ticketsBought.push(newTicket);
            eventsList[msg.sender].push(eventId);
            emit TicketPurchased(eventId, msg.sender, ticketQuantity);
        }
    }


    function cancelTicket(uint256 eventId, address _ticketHolder) external onlyAdminOrOrganiser(eventId){
        Event storage currentEvent = events[eventId];
        require(currentEvent.status != EventStatus.Cancelled, "Event is already cancelled");

        for (uint256 i = 0; i < currentEvent.ticketsBought.length; i++) {
            TicketHolder storage ticketHolder = currentEvent.ticketsBought[i];
            if (ticketHolder.ticketBuyer == _ticketHolder) {
                address payable ticketBuyer = payable(ticketHolder.ticketBuyer);
                uint256 refundAmount = currentEvent.eventTicketPrice * ticketHolder.purchasedTickets;
                // Check if the buyer has purchased tickets
                if (ticketHolder.purchasedTickets > 0) {
                    // Refund the buyer
                    payable(ticketBuyer).transfer(refundAmount);
                    currentEvent.eventAvailableTickets += ticketHolder.purchasedTickets;
                    ticketHolder.purchasedTickets = 0;
                    emit RefundProcessed(eventId, ticketBuyer, refundAmount);
                } else {
                    // No Tickets Found So Refund Is Already Processed
                    emit RefundAlreadyCompleted(eventId, ticketBuyer);
                }
            }
        }
    }

     function withdrawEventTicketMoney(uint256 eventId) external onlyAdminOrOrganiser(eventId)
      eventExists(eventId)
     {
        Event storage currentEvent = events[eventId];
        require(currentEvent.status != EventStatus.Cancelled, "Event is already cancelled");
        uint256 withdrawable_amount = 0;
        for (uint256 i = 0; i < currentEvent.ticketsBought.length; i++) {
            TicketHolder storage ticketHolder = currentEvent.ticketsBought[i];
            if(ticketHolder.purchasedTickets>0){
                withdrawable_amount += ticketHolder.purchasedTickets;
            }
        }

        if(withdrawable_amount>0){
            withdrawable_amount = withdrawable_amount * currentEvent.eventTicketPrice ;
            payable(currentEvent.eventOrganiser).transfer(withdrawable_amount);
            emit WithdrawComplete(eventId, msg.sender, withdrawable_amount);
        }
        else{
            emit NothingForWithdrawl(eventId,msg.sender);
        }

     }

    

    //Support Functions

    function getTicketHolder(uint256 eventId) onlyAdminOrOrganiser(eventId) external view returns (TicketHolder[] memory) {
        require(events[eventId].eventId != 0, "Event does not exist");
        return events[eventId].ticketsBought;
    }

    function getMyEventList(address _ticketHolder) external view returns (uint256[] memory) {
        if(eventsList[_ticketHolder].length>0){
            return eventsList[_ticketHolder];
        }
        uint256[] memory emptyArray;
        return emptyArray ;
    }

    function getLatestEventId() external view returns (uint256) {
        return eventIdCounter;
    }

    function isEventOrgraniser(address _address) external view returns (bool) {
        return eventOrganisers[_address];
    }
    
    function listAllEventId() external view returns (uint256[] memory) {
        return eventIdlist ;
    }

    function isAdmin(address _address) external view returns (bool) {
        return (owner == _address) ;
    }

    function getTicketQuantity(uint256 eventId, address _address ) external view returns (uint256 ){
        Event storage currentEvent = events[eventId];
        for (uint256 i = 0; i < currentEvent.ticketsBought.length; i++) {
            TicketHolder storage ticketHolder = currentEvent.ticketsBought[i];
            if (ticketHolder.ticketBuyer == _address) {
                return ticketHolder.purchasedTickets;
            }
        }
        uint256 quantity = 0;
        return quantity;
    }
}
