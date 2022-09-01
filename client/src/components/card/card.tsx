import React from 'react'

export interface Listing {
    title: string,
    id: string,
    userId: string,
}
interface CardProps {
    listing: Listing,
    handleOnGetInContact: Function,
}
const Card = ({listing, handleOnGetInContact} : CardProps) => {
    return (
        <div style={{border:'2px solid grey',borderRadius:'15px', padding: '2rem'}}>
            <h1>{listing.title}</h1>
            <button style={{backgroundColor: "pink", borderRadius:'5px', paddingInline:'10px'}} onClick={() => handleOnGetInContact(listing.id)}>Get in contact</button>
        </div>
    )
}

export default Card
