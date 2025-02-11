import React, { useState, useEffect } from "react";
import "./Converter.css";

function Converter() {
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("EUR");
    const [amount, setAmount] = useState(1);
    const [rate, setRate] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const accessKey = "dfce5a89ea680089bf8de80d60be4067"; 

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await fetch(
                    `http://api.exchangeratesapi.io/v1/latest?access_key=${accessKey}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCurrencies(Object.keys(data.rates));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const response = await fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${accessKey}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
                }
                const data = await response.json();
        
                if (!data.rates) throw new Error("Rates not available.");
        
                const fromRate = data.rates[fromCurrency];
                const toRate = data.rates[toCurrency];
        
                if (!fromRate || !toRate) throw new Error("Currency rates missing.");
        
                const newRate = toRate / fromRate;
                setRate(newRate);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching rate:", err);
            }
        };

        fetchRate();
    }, [fromCurrency, toCurrency]);

    useEffect(() => {
        if (rate && amount) {
            setConvertedAmount(amount * rate);
        }
    }, [amount, rate]);

    if (loading) {
        return <div>Loading currencies...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container">
            <div className="card">
                <h1>Currency Converter</h1>

                <div className="form-group">
                    <label>Amount:</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                    />
                </div>

                <div className="form-group">
                    <label>From:</label>
                    <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                        {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>To:</label>
                    <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                        {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>

                {convertedAmount !== null && (
                    <div className="result">
                        <h2>{convertedAmount.toFixed(2)} {toCurrency}</h2>
                        {rate && (
                            <p>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Converter;
