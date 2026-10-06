console.log("Nor Ellab Capital trading interface loaded.");


const assetSelect = document.getElementById("asset");
const amountInput = document.getElementById("amount");


const summaryRows = document.querySelectorAll(".summary-row");

const summaryAction =
    summaryRows[0].querySelector("strong");

const summaryAsset =
    summaryRows[1].querySelector("strong");

const summaryAmount =
    summaryRows[2].querySelector("strong");

const currentPriceDisplay =
    document.getElementById("current-price");

const summaryTotal =
    summaryRows[4].querySelector("strong");


const buyButton =
    document.querySelector(".buy-button");

const sellButton =
    document.querySelector(".sell-button");


const tradeStatus =
    document.getElementById("trade-status");

const tradeAction =
    document.getElementById("trade-action");


const btcPriceDisplay =
    document.getElementById("btc-price");

const ethPriceDisplay =
    document.getElementById("eth-price");

const solPriceDisplay =
    document.getElementById("sol-price");

const usdtPriceDisplay =
    document.getElementById("usdt-price");


let prices = {
    BTC: 0,
    ETH: 0,
    SOL: 0,
    USDT: 0
};


async function loadPrices() {

    try {

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd"
        );


        const data = await response.json();


        prices.BTC = data.bitcoin.usd;
        prices.ETH = data.ethereum.usd;
        prices.SOL = data.solana.usd;
        prices.USDT = data.tether.usd;


        btcPriceDisplay.textContent =
            "$" + prices.BTC.toLocaleString();


        ethPriceDisplay.textContent =
            "$" + prices.ETH.toLocaleString();


        solPriceDisplay.textContent =
            "$" + prices.SOL.toLocaleString();


        usdtPriceDisplay.textContent =
            "$" + prices.USDT.toLocaleString();


        updateSummary();

    } catch (error) {

        console.log(
            "Unable to load live prices."
        );

    }

}


function updateSummary() {

    const asset =
        assetSelect.value;


    const amount =
        Number(amountInput.value) || 0;


    const price =
        prices[asset];


    currentPriceDisplay.textContent =
        "$" + price.toLocaleString();


    const total =
        amount * price;


    summaryAsset.textContent =
        asset;


    summaryAmount.textContent =
        amount;


    summaryTotal.textContent =
        "$" + total.toLocaleString();

}


assetSelect.addEventListener(
    "change",
    updateSummary
);


amountInput.addEventListener(
    "input",
    updateSummary
);


buyButton.addEventListener(
    "click",
    function () {

        const asset =
            assetSelect.value;


        const amount =
            Number(amountInput.value) || 0;


        if (amount <= 0) {

            tradeStatus.textContent =
                "Please enter a valid amount greater than 0.";

            return;
        }


        tradeAction.textContent =
            "Buy";


        summaryAction.textContent =
            "Buy";


        tradeStatus.textContent =
            "Buy selected: " +
            amount +
            " " +
            asset +
            ".";

    }
);


sellButton.addEventListener(
    "click",
    function () {

        const asset =
            assetSelect.value;


        const amount =
            Number(amountInput.value) || 0;


        if (amount <= 0) {

            tradeStatus.textContent =
                "Please enter a valid amount greater than 0.";

            return;
        }


        tradeAction.textContent =
            "Sell";


        summaryAction.textContent =
            "Sell";


        tradeStatus.textContent =
            "Sell selected: " +
            amount +
            " " +
            asset +
            ".";

    }
);


updateSummary();


loadPrices();
