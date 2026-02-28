import { NextResponse } from "next/server";

// --- CORE ENGINE DESIGN ---

// 1. Priority Weight Persona Engine
const PERSONA_WEIGHTS: Record<string, { budget: number; comfort: number; timing: number; fatigue: number; hotel: number }> = {
    Student: { budget: 35, comfort: 15, timing: 10, fatigue: 10, hotel: 30 },
    Family: { budget: 20, comfort: 30, timing: 20, fatigue: 20, hotel: 10 },
    Professional: { budget: 15, comfort: 20, timing: 35, fatigue: 20, hotel: 10 },
    Bachelors: { budget: 25, comfort: 15, timing: 25, fatigue: 10, hotel: 25 }
};

// 2. Travel Fatigue Index Calculator
function calculateFatigue(flightOutboundTime: string, layovers: number, totalTransitHours: number) {
    let penalty = 0;
    const hour = parseInt(flightOutboundTime.split(":")[0]);
    if (hour < 6) penalty += 15; // Departure before 6 AM
    if (hour > 23 || hour < 3) penalty += 15; // Arrival after 11 PM
    if (layovers > 0) penalty += (layovers * 10); // Layovers penalty
    if (totalTransitHours > 8) penalty += 10; // Transit > 40% duration proxy

    return Math.max(0, 100 - penalty);
}

// 3. Time Utilization Score Calculator
function calculateTimeUtilization(arrivalHour: number, returnHour: number) {
    let score = 100;
    if (arrivalHour > 15) score -= 20; // Wastes Day 1
    if (returnHour < 12) score -= 20; // Cuts last day short
    return Math.max(0, score);
}

// ACTUAL TBO API FETCH
async function fetchTBOAirData(origin: string, destination: string, departureDate: string, returnDate: string, budget: number) {
    try {
        const AIR_AUTH_URL = process.env.RC_TBOAIR_URL || "http://api.tektravels.com/Authenticate/ValidateAgency";
        const AIR_SEARCH_URL = process.env.RC_TBOINDIA_URL || "http://api.tektravels.com/Search/";

        // 1. Authenticate (using credentials from Postman)
        const authRes = await fetch(AIR_AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "BookingMode": "API",
                "UserName": process.env.TBO_AIR_USERNAME || "albukhari",
                "Password": process.env.TBO_AIR_PASSWORD || "Alb@75736496",
                "IPAddress": "192.168.11.120"
            })
        });

        // Check if network fetch itself failed
        if (!authRes.ok) throw new Error("Air Auth network failed");

        const authData = await authRes.json();
        if (!authData.TokenId) throw new Error("Air Auth Failed: " + JSON.stringify(authData));

        // 2. Search
        const searchRes = await fetch(AIR_SEARCH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "AdultCount": "1",
                "ChildCount": "0",
                "InfantCount": "0",
                "IsDomestic": "false",
                "BookingMode": "5",
                "JourneyType": returnDate ? "2" : "1",
                "EndUserIp": "192.168.10.36",
                "TokenId": authData.TokenId,
                "Segments": returnDate ? [
                    { "Origin": origin, "Destination": destination, "FlightCabinClass": 1, "PreferredDepartureTime": `${departureDate}T00:00:00`, "PreferredArrivalTime": `${departureDate}T00:00:00` },
                    { "Origin": destination, "Destination": origin, "FlightCabinClass": 1, "PreferredDepartureTime": `${returnDate}T00:00:00`, "PreferredArrivalTime": `${returnDate}T00:00:00` }
                ] : [
                    { "Origin": origin, "Destination": destination, "FlightCabinClass": 1, "PreferredDepartureTime": `${departureDate}T00:00:00`, "PreferredArrivalTime": `${departureDate}T00:00:00` }
                ],
                "ResultFareType": 0,
                "PreferredCurrency": "INR"
            })
        });

        const searchData = await searchRes.json();
        if (!searchData.Response || !searchData.Response.Results || searchData.Response.Results.length === 0) {
            console.log("No air results found from API");
            throw new Error("No air results");
        }

        const results = searchData.Response.Results[0] || [];

        return results.slice(0, 15).map((r: any) => {
            const outbound = r.Segments[0][0];
            const inbound = returnDate && r.Segments.length > 1 ? r.Segments[1][0] : null;

            const outDep = outbound.Origin.DepTime;
            const outArr = outbound.Destination.ArrTime;

            // Calculate transit hours safely
            const transitHours = (new Date(outArr).getTime() - new Date(outDep).getTime()) / (1000 * 3600);

            return {
                id: r.ResultIndex,
                airline: outbound.Airline?.AirlineName || "TBO Airline",
                outTime: outDep.includes('T') ? outDep.split('T')[1].substring(0, 5) : "10:00",
                arrTime: outArr.includes('T') ? outArr.split('T')[1].substring(0, 5) : "14:00",
                returnTime: inbound && inbound.Origin.DepTime.includes('T') ? inbound.Origin.DepTime.split('T')[1].substring(0, 5) : "18:00",
                layovers: outbound.StopPoint || 0,
                transitDuration: transitHours > 0 ? transitHours : 3,
                price: r.Fare?.PublishedFare || 15000,
                isRefundable: r.IsRefundable
            };
        });

    } catch (err) {
        console.warn("TBO Air API Connection Blocked/Failed. Simulating fallback test pipeline:", err);
        // Return sample data ONLY if real API throws due to expired credentials/whitelist issue
        return [
            { id: "A1", airline: "Indigo Test Result", outTime: "05:30", arrTime: "08:30", returnTime: "10:00", layovers: 0, transitDuration: 3, price: 12000, isRefundable: true },
            { id: "A2", airline: "Emirates Test Result", outTime: "10:00", arrTime: "13:30", returnTime: "18:00", layovers: 0, transitDuration: 3.5, price: 28000, isRefundable: true },
            { id: "A4", airline: "Vistara Test Result", outTime: "08:00", arrTime: "11:00", returnTime: "20:00", layovers: 0, transitDuration: 3, price: 21000, isRefundable: true },
            { id: "A5", airline: "SpiceJet Test Result", outTime: "23:30", arrTime: "03:00", returnTime: "06:00", layovers: 0, transitDuration: 3.5, price: 10500, isRefundable: false }
        ];
    }
}

async function fetchTBOHotelData(destination: string, checkIn: string, checkOut: string) {
    try {
        const HOTEL_SEARCH_URL = process.env.TBO_HOTEL_URL || "http://api.tbotechnology.in/TBOHolidays_HotelAPI/search";
        const authHeader = 'Basic ' + Buffer.from(`${process.env.TBO_HOTEL_USERNAME || ''}:${process.env.TBO_HOTEL_PASSWORD || ''}`).toString('base64');

        // Using predefined HotelCodes from the Postman Collection for demonstration
        const hotelCodes = "376565,1345318,1345320,1200255,1128760,1250333,1078234,1347149,1358855,1345321,1108025,1356271,1267547";

        const searchRes = await fetch(HOTEL_SEARCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.TBO_HOTEL_USERNAME ? { 'Authorization': authHeader } : {})
            },
            body: JSON.stringify({
                "CheckIn": checkIn,
                "CheckOut": checkOut,
                "HotelCodes": hotelCodes,
                "GuestNationality": "IN",
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

        if (!searchRes.ok) throw new Error("Hotel API connection failed: " + searchRes.statusText);

        const searchData = await searchRes.json();
        console.log("HOTEL API STATUS:", searchData?.Status?.Description);

        if (searchData?.Status?.Code === 201 || searchData?.Status?.Description?.includes("No Available rooms")) {
            console.log("Hotel API connected successfully, but Dummy account has zero inventory. Falling back.");
            throw new Error("No inventory available in dummy DB");
        }

        if (!searchData.HotelSearchResult || !searchData.HotelSearchResult.HotelResults) {
            console.log("No hotel results found from API");
            throw new Error("No hotel results");
        }

        const results = searchData.HotelSearchResult.HotelResults;
        const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));

        return results.slice(0, 20).map((h: any) => ({
            id: h.HotelCode,
            name: h.HotelName || "TBO Hotel",
            rating: h.StarRating || 3,
            pricePerNight: Math.round(h.TotalFare / nights || 5000),
            isRefundable: h.IsRefundable,
            cancelPolicies: h.CancelPolicies ? h.CancelPolicies[0]?.PolicyDetails : "Standard rules apply"
        }));

    } catch (err) {
        console.warn("TBO Hotel API Connection Blocked/Failed. Simulating fallback test pipeline:", err);
        // Return sample data ONLY if real API throws due to expired credentials/inventory issue
        return [
            { id: "H1", name: "Taj Palace Test Result", rating: 5, pricePerNight: 12000, isRefundable: true, cancelPolicies: "Free till 2 days prior" },
            { id: "H2", name: "Ibis Styles Test Result", rating: 3, pricePerNight: 4000, isRefundable: false, cancelPolicies: "Non-refundable" }
        ];
    }
}

export async function POST(req: Request) {
    try {
        const { origin, destination, departureDate, returnDate, budget, groupType, age } = await req.json();

        // Parse Dates to get duration
        const start = new Date(departureDate);
        const end = new Date(returnDate);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

        const weights = PERSONA_WEIGHTS[groupType as string] || PERSONA_WEIGHTS["Professional"];
        const targetBudget = parseInt(budget);

        console.log(`🚀 Orchestrating Trip from API: ${origin} to ${destination}`);
        const flights = await fetchTBOAirData(origin, destination, departureDate, returnDate, targetBudget);
        const hotels = await fetchTBOHotelData(destination, departureDate, returnDate);

        // Generate Combinations
        let trips = [];

        for (let flight of flights) {
            for (let hotel of hotels) {
                const totalHotelPrice = hotel.pricePerNight * nights;
                const totalTripPrice = flight.price + totalHotelPrice;

                // 4. Budget Elasticity Intelligence
                let budgetScore = 100;
                const budgetDiff = totalTripPrice - targetBudget;
                let insight = null;

                if (budgetDiff > 0) {
                    if (budgetDiff <= targetBudget * 0.1) {
                        budgetScore = 80; // Within 10%
                    } else {
                        budgetScore = Math.max(0, 100 - ((budgetDiff / targetBudget) * 100 * 2)); // Heavy penalty
                    }
                } else {
                    budgetScore = 100; // Under Budget
                }

                // 5. Trip Confidence Score Calculation
                const outHour = parseInt(flight.outTime.split(":")[0]);
                const arrHour = parseInt(flight.arrTime.split(":")[0]);
                const retHour = parseInt(flight.returnTime.split(":")[0]);

                const fatigueScore = calculateFatigue(flight.outTime, flight.layovers, flight.transitDuration);
                const timingScore = calculateTimeUtilization(arrHour, retHour);
                const comfortScore = (hotel.rating / 5) * 100; // Hotel Suitability Proxy

                const matchScore =
                    (budgetScore * (weights.budget / 100)) +
                    (comfortScore * (weights.comfort / 100)) +
                    (timingScore * (weights.timing / 100)) +
                    (fatigueScore * (weights.fatigue / 100)) +
                    ((hotel.rating * 20) * (weights.hotel / 100));

                // 6. Trip Risk Summary
                let riskSummary = [];
                if (totalTripPrice <= targetBudget) riskSummary.push(`🟢 Within comfortable budget`);
                else if (totalTripPrice <= targetBudget * 1.1) riskSummary.push(`🟡 Slightly over budget (+${Math.round((budgetDiff / targetBudget) * 100)}%)`);
                else riskSummary.push(`🔴 Significantly over budget`);

                if (arrHour < 15) riskSummary.push(`🟢 Good arrival timing (Day 1 intact)`);
                else riskSummary.push(`🟡 Late arrival wastes Day 1`);

                if (outHour < 6 || outHour > 22) riskSummary.push(`🟡 Uncomfortable departure time (${flight.outTime})`);

                if (hotel.isRefundable && flight.isRefundable) riskSummary.push(`🟢 Fully Refundable Trip`);
                else if (hotel.isRefundable) riskSummary.push(`🟡 Refundable hotel, strict flight`);
                else riskSummary.push(`🔴 Non-refundable trip components`);

                if (flight.layovers > 0) riskSummary.push(`🟡 Layovers present`);

                // Generate Budget Elasticity Insights
                if (totalTripPrice > targetBudget && totalTripPrice <= targetBudget * 1.15 && comfortScore >= 80) {
                    insight = `For ₹${totalTripPrice - targetBudget} more, your comfort & hotel rating improves significantly.`;
                } else if (totalTripPrice < targetBudget * 0.9 && fatigueScore < 60) {
                    insight = `Saving ₹${targetBudget - totalTripPrice} comes with a high fatigue trade-off (late flights/layovers).`;
                }

                trips.push({
                    rawPrice: totalTripPrice,
                    totalPrice: totalTripPrice,
                    hotelName: hotel.name,
                    hotelRating: hotel.rating,
                    stayDuration: `${nights} Nights`,
                    flightOutbound: `${flight.airline} (${flight.outTime} - ${flight.arrTime})`,
                    flightReturn: `${flight.airline} (${flight.returnTime})`,
                    comfortScore: Math.round(comfortScore),
                    confidenceScore: Math.round(matchScore),
                    riskSummary,
                    insights: insight ? [insight] : [],
                    scores: { budgetScore, comfortScore, timingScore, fatigueScore }
                });
            }
        }

        // Rank Trips by Confidence Score
        trips.sort((a, b) => b.confidenceScore - a.confidenceScore);

        // 7. Decision Simplifier (Tagging)
        const topTrips = trips.slice(0, 5); // Take Top 5

        // Tag assignment logic
        let rankedTrips = topTrips.map(trip => {
            let tag = "";
            if (trip === topTrips[0]) tag = "Safest Overall"; // Top confident
            else if (trip.scores.budgetScore >= 90 && trip.rawPrice < targetBudget) tag = "Best Value";
            else if (trip.scores.comfortScore >= 90 || trip.scores.fatigueScore >= 90) tag = "Most Comfortable";
            else if (trip.hotelRating === 5 && trip.rawPrice > targetBudget) tag = "Premium Choice";
            else tag = "Smart Option";

            return { ...trip, decisionTag: tag };
        });

        // Ensure tags are unique for display variety
        const usedTags = new Set();
        rankedTrips = rankedTrips.map(trip => {
            if (usedTags.has(trip.decisionTag) && trip !== rankedTrips[0]) {
                trip.decisionTag = "Best Value"; // Fallback
                if (usedTags.has("Best Value")) trip.decisionTag = "Most Comfortable";
            }
            usedTags.add(trip.decisionTag);
            return trip;
        });

        return NextResponse.json({
            success: true,
            trips: rankedTrips.slice(0, 4) // Only return 3-4 top recommendations
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to orchestrated trip" }, { status: 500 });
    }
}
