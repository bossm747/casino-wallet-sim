import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";

const BalanceCard = ({ balance }) => (
  <div className="mb-4">
    <h2 className="text-xl font-semibold">Current Balance: ₱{balance.toFixed(2)}</h2>
  </div>
);

const TransactionButtons = ({ formData, handleChange, handleSubmit }) => (
  <div className="flex space-x-2">
    <Dialog>
      <DialogTrigger asChild>
        <Button>Deposit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>
        <form>
          <div className="mb-4">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="pay_method">Pay Method</Label>
            <select
              id="pay_method"
              name="pay_method"
              value={formData.pay_method}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="sp-qrph">SP-QRPH</option>
            </select>
          </div>
          <Button type="button" onClick={() => handleSubmit("/payin")}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog>
      <DialogTrigger asChild>
        <Button>Withdraw</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw</DialogTitle>
        </DialogHeader>
        <form>
          <div className="mb-4">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="pay_method">Pay Method</Label>
            <select
              id="pay_method"
              name="pay_method"
              value={formData.pay_method}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="sp-qrph">SP-QRPH</option>
            </select>
          </div>
          <Button type="button" onClick={() => handleSubmit("/payout")}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  </div>
);

const TransactionHistory = ({ transactions }) => (
  <div className="mt-4">
    <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
    <ul className="bg-gray-100 p-2 rounded">
      {transactions.map((transaction, index) => (
        <li key={index} className="mb-2">
          <div>{transaction.timestamp}</div>
          <div>{transaction.endpoint === "/payin" ? "Deposit" : "Withdraw"}: ₱{transaction.amount}</div>
          <div>Remarks: {transaction.remarks}</div>
        </li>
      ))}
    </ul>
  </div>
);

const Index = () => {
  const [formData, setFormData] = useState({
    amount: "100",
    pay_method: "sp-qrph",
    remarks: "remarks payin",
  });

  const [result, setResult] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  useEffect(() => {
    const storedBalance = localStorage.getItem("balance");
    const storedTransactions = localStorage.getItem("transactions");

    if (storedBalance) setBalance(parseFloat(storedBalance));
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
  }, []);

  useEffect(() => {
    localStorage.setItem("balance", balance);
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [balance, transactions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (endpoint) => {
    try {
      const response = await fetch('https://api.nexuspay.cloud/payin/process', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer W6Bqqa2nhGmcWKFg5trryaaQjtOspejlo33Oep4="
        },
        body: JSON.stringify({
          name: "gerald",
          email: "marcSmith@yahoo.com",
          amount: formData.amount,
          pay_method: formData.pay_method,
          mobilenumber: "0909333322",
          address: "Manila ph",
          webhook: "https://api.nexuspay.cloud/payin/payinwebhook.php",
          remarks: formData.remarks,
          currency: "PHP",
          reference: "1234567890",
          transaction_id: "txn_1234567890"
        }),
      });

      const result = await response.json();
      setResult(result);

      if (result.redirect_url) {
        setPaymentUrl(result.redirect_url);
        setShowModal(true);
        return;
      }

      if (endpoint === "/payin") {
        setBalance((prevBalance) => prevBalance + parseFloat(formData.amount));
      } else if (endpoint === "/payout") {
        setBalance((prevBalance) => prevBalance - parseFloat(formData.amount));
      }

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        { ...formData, endpoint, timestamp: new Date().toISOString() },
      ]);

      toast.success("Transaction successful!");
    } catch (error) {
      toast.error("Transaction failed!");
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">My Lazy Wallet</h1>
      <BalanceCard balance={balance} />
      <TransactionButtons formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
      )}
      <TransactionHistory transactions={transactions} />
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <iframe src={paymentUrl} title="Payment" className="w-full h-64"></iframe>
          <Button onClick={() => window.location.href = paymentUrl}>Pay</Button>
        </Modal>
      )}
    </div>
  );
};

export default Index;