import React from "react";
import { Card, ListGroup } from "react-bootstrap";

const BID_EVENT = "BidEvent";
const WITHDRAWN_EVENT = "WithdrawnEvent";
const CANCELLED_EVENT = "CancelledEvent";
const ENDED_EVENT = "EndedEvent";

function EventHistory(props) {
  const [events, formatBalance] = props.context;

  const processEvent = event => {
    let message = "";
    switch(event.name) {
      case BID_EVENT: 
        message = "Bidder(" + event.address + "), " 
        + (event.amount ? "Amount:(" + formatBalance(event.amount) +") ETH,": "") 
        + "Timestamp(" + event.timestamp +")";
        break;
      case ENDED_EVENT:
        message = "Message(" + event.message + "), "
        + "Timestamp(" + event.timestamp +")";
        break;
      case CANCELLED_EVENT:
        message = "Message(" + event.message + "), "
        + "Timestamp(" + event.timestamp +")";
        break;
      case WITHDRAWN_EVENT:
        message = "Withdrawer(" + event.address + "), " 
        + (event.amount ? "Amount:(" + formatBalance(event.amount) +") ETH,": "") 
        + "Timestamp(" + event.timestamp +")";
        break;
    }
    return message;
  };

  return (
    <div className="mt-5">
      <Card className="p-3">
        <h4>Event History</h4>
        <ListGroup variant="flush">
          {events.map((event, index) => (
            <ListGroup.Item key={index}>
              <span>
                <strong>[{event.name}] - </strong> {processEvent(event)}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </div>
  );
}

export default EventHistory;


