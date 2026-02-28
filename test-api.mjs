import fs from 'fs';

let output = '';

async function testAirAuth() {
    output += "=== Testing Air Auth ===\n";
    try {
        const res = await fetch("http://api.tektravels.com/Authenticate/ValidateAgency", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "BookingMode": "API",
                "UserName": "Hackathon",
                "Password": "Hackathon@1234",
                "IPAddress": "106.219.162.147"
            })
        });
        const text = await res.text();
        output += "Air Auth Response Text: " + text + "\n";
    } catch (err) {
        output += "Air Auth Error: " + err.message + "\n";
    }
}

async function testHotelSearch() {
    output += "\n=== Testing Hotel Search ===\n";
    try {
        const authHeader = 'Basic ' + Buffer.from('hackathontest:Hac@98147521').toString('base64');
        const searchRes = await fetch("http://api.tbotechnology.in/TBOHolidays_HotelAPI/search", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                "CheckIn": "2026-03-15",
                "CheckOut": "2026-03-17",
                "HotelCodes": "376565,1345318,1345320,1200255,1128760,1250333,1078234,1347149,1358855,1345321,1108025,1356271,1267547",
                "GuestNationality": "AE",
                "PaxRooms": [{ "Adults": 1, "Children": 0, "ChildrenAges": [] }],
                "ResponseTime": 20.0,
                "IsDetailedResponse": true,
                "Filters": {
                    "Refundable": true,
                    "NoOfRooms": 0,
                    "MealType": 0,
                    "OrderBy": 0,
                    "StarRating": 0,
                    "HotelName": null
                }
            })
        });
        const text = await searchRes.text();
        output += "Hotel Search Response Text: " + text + "\n";
    } catch (err) {
        output += "Hotel Search Error: " + err.message + "\n";
    }
}

testAirAuth().then(testHotelSearch).then(() => {
    fs.writeFileSync('results.txt', output);
});

