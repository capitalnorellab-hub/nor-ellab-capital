
(() => {
  const SUPABASE_URL = "https://grgmsezyxxceheofmsoj.supabase.co";
  const SUPABASE_KEY = "sb_publishable_wQ7jOyAqk1nAm_rQAapqog_Q5z_wTbc";
  const BUCKET = "payment-screenshots";

  const WALLETS = {
    USDT: "TFx5QpQQFJuEYJsGcC7v19W8L8afi64iqdf",
    BTC: "bc1qu5vz52cyld9kma0f0y7jrhpcqv686httm822u6"
  };

  const C = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  let user;

  const $ = id => document.getElementById(id);

  function msg(id, text, type = "") {
    if ($(id)) {
      $(id).textContent = text;
      $(id).className = "message " + type;
    }
  }

  function usd(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(value) || 0);
  }

  function date(value) {
    return value
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      : "—";
  }

  function empty(id, columns, text) {
    if (!$(id)) return;

    $(id).replaceChildren();

    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = columns;
    td.textContent = text;

    tr.appendChild(td);
    $(id).appendChild(tr);
  }

  function cell(tr, value) {
    const td = document.createElement("td");

    td.textContent =
      value === null || value === undefined || value === ""
        ? "—"
        : String(value);

    tr.appendChild(td);
    return td;
  }

  function rows(id, columns, records, build, noRecords) {
    if (!$(id)) return;

    $(id).replaceChildren();

    if (!records || records.length === 0) {
      empty(id, columns, noRecords);
      return;
    }

    records.forEach(record => {
      const tr = document.createElement("tr");
      build(tr, record);
      $(id).appendChild(tr);
    });
  }

  function screenshotExtension(file) {
    const types = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };

    return types[file.type] || null;
  }

  function validateScreenshot(file) {
    if (!file) return "Please upload your payment screenshot.";

    if (!screenshotExtension(file)) {
      return "Please upload a JPG, PNG, or WebP image.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "The screenshot must be 5 MB or smaller.";
    }

    return "";
  }

  async function uploadScreenshot(file) {
    const extension = screenshotExtension(file);

    if (!extension) {
      throw new Error("Unsupported screenshot format.");
    }

    const filename =
      Date.now() + "-" +
      Math.random().toString(36).slice(2) +
      "." + extension;

    const path = user.id + "/" + filename;

    const { error } = await C.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw new Error("Screenshot upload failed: " + error.message);
    }

    return path;
  }

  function totalByStatus(records, status) {
    return records.reduce((sum, record) => {
      const recordStatus = String(record.status || "")
        .trim()
        .toLowerCase();

      if (recordStatus === status.toLowerCase()) {
        return sum + (Number(record.amount) || 0);
      }

      return sum;
    }, 0);
  }

  // Deposit totals remain separate from investment totals.
  function totalDepositStatus(records, status) {
    return totalByStatus(records, status);
  }

  async function loadOverview() {
    msg("pageMessage", "Loading your account information...");

    const investments = await C
      .from("investments")
      .select("amount,status")
      .eq("user_id", user.id);

    if (investments.error) {
      msg(
        "pageMessage",
        "Investment records could not load: " + investments.error.message,
        "error"
      );
      return;
    }

    const investmentRecords = investments.data || [];

    const deposits = await C
      .from("deposits")
      .select("amount,status")
      .eq("user_id", user.id);

    if (deposits.error) {
      msg(
        "pageMessage",
        "Deposit records could not load: " + deposits.error.message,
        "error"
      );
      return;
    }

    const paymentReviews = await C
      .from("crypto_payment_requests")
      .select("status")
      .eq("user_id", user.id);

    if (paymentReviews.error) {
      msg(
        "pageMessage",
        "Payment review records could not load: " + paymentReviews.error.message,
        "error"
      );
      return;
    }

    // Include only Active/Completed investments and Completed deposits.
    // Pending or rejected records are never counted as approved funds.
    const approvedInvestmentAmount =
      totalByStatus(investmentRecords, "Active") +
      totalByStatus(investmentRecords, "Completed");

    const approvedDepositAmount =
      totalDepositStatus(deposits.data || [], "Verified") +
      totalDepositStatus(deposits.data || [], "Completed");

    const approvedFundsAmount =
      approvedInvestmentAmount + approvedDepositAmount;

    const pendingReviewCount = (paymentReviews.data || []).filter(record =>
      String(record.status || "Pending").trim().toLowerCase() === "pending"
    ).length;

    $("approvedInvestmentTotal").textContent = usd(approvedFundsAmount);
    $("investmentCount").textContent = investmentRecords.length;
    $("pendingPaymentReviews").textContent = pendingReviewCount;

    msg(
      "pageMessage",
      "Your account overview has been updated.",
      "success"
    );
  }

  async function start() {
    const currentFile =
      location.pathname.split("/").pop() || "dashboard.html";

    document.querySelectorAll("nav a").forEach(link => {
      if (link.getAttribute("href") === currentFile) {
        link.setAttribute("aria-current", "page");
      }
    });

    if ($("logoutButton")) {
      $("logoutButton").onclick = async () => {
        const { error } = await C.auth.signOut();

        if (error) {
          alert(error.message);
          return;
        }

        location.href = "login.html";
      };
    }

    const { data, error } = await C.auth.getSession();

    if (error || !data.session) {
      if ($("userEmail")) {
        $("userEmail").textContent = "Please log in";
      }

      setTimeout(() => {
        location.href = "login.html";
      }, 900);

      return;
    }

    user = data.session.user;

    if ($("userEmail")) {
      $("userEmail").textContent = user.email || "Investor account";
    }

    const page = document.body.dataset.page;

    if (page === "overview") {
      await loadOverview();
    }

    if (page === "investments") {
      const result = await C
        .from("investments")
        .select("investment_name,investment_type,amount,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (result.error) {
        empty("investmentsTable", 4, "Could not load investments");
        msg("pageMessage", result.error.message, "error");
      } else {
        rows(
          "investmentsTable",
          4,
          result.data,
          (tr, record) => {
            cell(tr, record.investment_type || record.investment_name);
            cell(tr, usd(record.amount));
            cell(tr, record.status || "Pending");
            cell(tr, date(record.created_at));
          },
          "No investment requests yet"
        );

        msg(
          "pageMessage",
          (result.data || []).length + " record(s) found",
          "success"
        );
      }
    }

    if ($("investmentForm")) {
      const form = $("investmentForm");
      const button = $("investButton");

      function updateWallet() {
        const currency = $("walletCurrency")?.value || "USDT";

        if ($("walletLabel")) {
          $("walletLabel").textContent =
            currency === "BTC"
              ? "Bitcoin (BTC) wallet address"
              : "USDT (TRC20) wallet address";
        }

        if ($("walletAddress")) {
          $("walletAddress").textContent =
            WALLETS[currency] || WALLETS.USDT;
        }

        if ($("paymentCurrency")) {
          $("paymentCurrency").value = currency;
        }
      }

      if ($("walletCurrency")) {
        $("walletCurrency").onchange = updateWallet;
      }

      updateWallet();

      if ($("copyWalletButton")) {
        $("copyWalletButton").onclick = async () => {
          try {
            await navigator.clipboard.writeText(
              $("walletAddress").textContent
            );

            msg("formMessage", "Wallet address copied.", "success");
          } catch {
            msg(
              "formMessage",
              "Copy unavailable. Select and copy the wallet address manually.",
              "error"
            );
          }
        };
      }

      form.onsubmit = async event => {
        event.preventDefault();

        const amount = Number($("investmentAmount")?.value);
        const category = $("investmentCategory")?.value;
        const screenshot = $("paymentScreenshot")?.files?.[0];

        if (!category || !Number.isFinite(amount) || amount <= 0) {
          msg(
            "formMessage",
            "Enter a valid investment category and amount.",
            "error"
          );
          return;
        }

        const screenshotError = validateScreenshot(screenshot);

        if (screenshotError) {
          msg("formMessage", screenshotError, "error");
          return;
        }

        if (button) {
          button.disabled = true;
          button.textContent = "Submitting...";
        }

        try {
          const screenshotPath = await uploadScreenshot(screenshot);

          const { error: insertError } = await C
            .from("investments")
            .insert({
              user_id: user.id,
              investment_name: category,
              investment_type: category,
              amount: amount,
              status: "Pending",
              payment_screenshot_path: screenshotPath
            });

          if (insertError) {
            throw new Error(
              "Could not save the investment request: " +
              insertError.message
            );
          }

          form.reset();
          updateWallet();

          msg(
            "formMessage",
            "Investment request submitted. Status: Pending. Payment has not been automatically verified.",
            "success"
          );
        } catch (err) {
          msg(
            "formMessage",
            err.message || "Submission failed. Please try again.",
            "error"
          );
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = "Submit Investment";
          }
        }
      };
    }

    if (page === "payment-review") {
      const form = $("paymentReviewForm");

      if (form) {
        form.onsubmit = async event => {
          event.preventDefault();

          const currency = $("paymentCurrency")?.value || "USDT";
          const amountUSD = Number($("paymentAmount")?.value);
          const reference = $("transactionReference")?.value.trim();
          const notes = $("paymentNotes")?.value.trim() || "";

          if (!Number.isFinite(amountUSD) || amountUSD <= 0 || !reference) {
            msg("formMessage", "Enter a valid amount and transaction reference.", "error");
            return;
          }

          const button = $("paymentButton");
          if (button) {
            button.disabled = true;
            button.textContent = "Submitting...";
          }

          try {
            const { error: insertError } = await C
              .from("crypto_payment_requests")
              .insert({
                user_id: user.id,
                asset: currency,
                amount: amountUSD,
                price: 1,
                total: amountUSD,
                payment_method: currency === "BTC" ? "Bitcoin (BTC)" : "USDT (TRC20)",
                payment_reference: reference,
                status: "Pending"
              });

            if (insertError) {
              throw new Error(insertError.message);
            }

            form.reset();
            msg(
              "formMessage",
              "Your payment reference was submitted for review. It is pending verification; this does not confirm that payment was received.",
              "success"
            );
          } catch (err) {
            msg(
              "formMessage",
              "Payment review could not be submitted: " + (err.message || "Please try again."),
              "error"
            );
          } finally {
            if (button) {
              button.disabled = false;
              button.textContent = "Submit for Review";
            }
          }
        };
      }
    }

    if (page === "crypto-history") {
      const result = await C
        .from("crypto_payment_requests")
        .select("asset,amount,payment_reference,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (result.error) {
        empty("historyTable", 5, "Crypto history unavailable");
        msg("pageMessage", result.error.message, "error");
      } else {
        rows(
          "historyTable",
          5,
          result.data,
          (tr, record) => {
            cell(tr, date(record.created_at));
            cell(tr, record.asset);
            cell(tr, usd(record.amount));
            cell(tr, record.payment_reference);
            cell(tr, record.status || "Pending");
          },
          "No crypto payments submitted"
        );

        msg(
          "pageMessage",
          (result.data || []).length + " record(s) found",
          "success"
        );
      }
    }

    if (page === "deposit-history") {
      const result = await C
        .from("deposits")
        .select("asset,amount,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (result.error) {
        empty("historyTable", 4, "Could not load deposit records");
        msg(
          "pageMessage",
          "Deposit history could not be loaded: " + result.error.message,
          "error"
        );
      } else {
        rows(
          "historyTable",
          4,
          result.data,
          (tr, record) => {
            cell(tr, date(record.created_at));
            cell(tr, record.asset);
            cell(tr, usd(record.amount));
            cell(tr, record.status || "Pending");
          },
          "No deposit records found"
        );

        msg(
          "pageMessage",
          (result.data || []).length + " deposit record(s) found",
          "success"
        );
      }
    }

    if (page === "transactions") {
      const result = await C
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (result.error) {
        empty("historyTable", 5, "Transactions table not connected");
        msg(
          "pageMessage",
          "Transactions could not be loaded: " + result.error.message,
          "error"
        );
      } else {
        rows(
          "historyTable",
          5,
          result.data,
          (tr, record) => {
            cell(tr, date(record.created_at));
            cell(
              tr,
              record.type ||
              record.transaction_type ||
              record.description ||
              "Transaction"
            );
            cell(tr, record.currency);
            cell(
              tr,
              record.amount == null ? "—" : usd(record.amount)
            );
            cell(tr, record.status);
          },
          "No transaction records found"
        );
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    start().catch(error => {
      console.error("Dashboard error:", error);

      msg(
        "pageMessage",
        "The page could not finish loading: " + error.message,
        "error"
      );

      msg(
        "formMessage",
        "The page could not finish loading. Please refresh and try again.",
        "error"
      );
    });
  });
})();
