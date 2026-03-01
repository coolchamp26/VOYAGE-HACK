
async function test() {
    console.log("Starting test...");
    try {
        const auth = await fetch("http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "ClientId": "ApiIntegrationNew",
                "UserName": "Hackathon",
                "Password": "Hackathon@1234",
                "EndUserIp": "192.168.10.10"
            })
        }).then(r => r.json());

        const tokenId = auth.TokenId;
        console.log("Token:", tokenId);

        const routes = [
            { o: "DEL", d: "BOM" },
            { o: "DEL", d: "DXB" },
            { o: "BOM", d: "DXB" },
            { o: "LON", d: "PAR" }
        ];

        for (const r of routes) {
            const res = await fetch("http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    EndUserIp: "192.168.10.10",
                    TokenId: tokenId,
                    AdultCount: "1",
                    ChildCount: "0",
                    InfantCount: "0",
                    DirectFlight: "false",
                    OneStopFlight: "false",
                    JourneyType: "1",
                    Segments: [{
                        Origin: r.o,
                        Destination: r.d,
                        FlightCabinClass: "1",
                        PreferredDepartureTime: "2026-05-15T00:00:00",
                        PreferredArrivalTime: "2026-05-15T00:00:00"
                    }]
                })
            }).then(res => res.json());

            const msg = res.Response.Error.ErrorMessage;
            const count = res.Response.Results ? res.Response.Results[0].length : 0;
            console.log(`${r.o}-${r.d}: ${msg || 'SUCCESS'} (${count} results)`);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
