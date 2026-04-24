# SSH Connection Troubleshooting (EC2 Timeout)

When you get an SSH timeout to EC2 (especially after adding your IP to the security group), work through this checklist.

---

## 1. Confirm your current public IP

Your IP changes when you move (e.g. coffee shop, home, office). The security group must allow **this** IP.

```bash
# From your laptop (terminal)
curl -s ifconfig.me
# or
curl -s https://checkip.amazonaws.com
```

Use this exact IP (or its CIDR, e.g. `x.x.x.x/32`) in the security group.

---

## 2. Security group checklist

In **AWS Console → EC2 → Security Groups** (or **Instances → instance → Security** tab):

| Check | What to verify |
|-------|----------------|
| **Correct security group** | The security group you edit is the one attached to your instance (see instance details). |
| **Inbound rule for SSH** | Type: **SSH**, Port: **22**, Source: **Your IP/32** (e.g. `203.0.113.45/32`). |
| **No typo in IP** | One wrong digit and the rule won’t match. |
| **Saved** | Save / apply the rule; some UIs need an explicit “Save” step. |
| **Only one rule needed** | You can have one rule: `Your current IP/32` on port 22. Add a new rule for the new IP; old IPs can be removed. |

**Common mistake:** Editing a security group that isn’t attached to this instance (e.g. default vs custom SG).

---

## 3. Instance public IP vs Elastic IP

- **No Elastic IP:** If you stop/start the instance, AWS assigns a **new public IP**. Old IP in the security group is still fine; the **host** you SSH to must be the **new** public IP or hostname.
- **With Elastic IP:** The public IP stays the same; use that IP (or its DNS) to SSH.

**Action:** In **EC2 → Instances**, select your instance and check **Public IPv4 address** (and **Public IPv4 DNS**). Use that exact address in your SSH command:

```bash
ssh -i /path/to/your-key.pem ubuntu@<Public-IPv4-or-DNS>
```

If the instance was stopped/started since you last connected, the IP likely changed.

---

## 4. Instance state

In **EC2 → Instances**:

- **State** must be **Running**.
- If it’s **Stopped**, start it and wait until “Running” (and note the new public IP if you don’t use Elastic IP).
- If it’s **Stopping** or **Pending**, wait before retrying SSH.

---

## 5. Network ACLs (NACLs)

If the security group allows your IP but you still timeout, the subnet’s **Network ACL** might be blocking traffic.

- **EC2 → VPC → Network ACLs** → open the NACL associated with your instance’s subnet.
- Ensure:
  - **Inbound:** Allows your IP (or `0.0.0.0/0`) for port 22 and possibly ephemeral ports (e.g. 1024–65535) for return traffic.
  - **Outbound:** Allows return traffic (often `0.0.0.0/0` for all or at least ephemeral ports).

If you didn’t change NACLs, they’re often not the cause, but worth checking if SG and IP are correct.

---

## 6. Coffee shop / network blocking SSH

Some public Wi‑Fi networks block outbound port 22.

**Quick test:** From the same network, try:

```bash
# Replace with your instance’s public IP
nc -vz <instance-public-ip> 22
# or
telnet <instance-public-ip> 22
```

- **Timeout or “Connection refused” from same network:** Could be firewall (SG/NACL) or network blocking.
- **“Connection refused”** (not timeout) often means something is reachable but nothing is listening on 22 (e.g. wrong IP or SSH not running).
- If you have a **phone hotspot**, try SSH from the same laptop over the hotspot. If it works only on hotspot, the coffee shop network is likely blocking outbound 22.

**Workaround if SSH is blocked:** Use **AWS Systems Manager Session Manager** (no inbound port 22 needed) if it’s set up, or connect from another network (e.g. home).

---

## 7. SSH command and key

```bash
ssh -i /path/to/your-key.pem ubuntu@<instance-public-ip-or-dns>
```

- **Key:** Correct `.pem` for this instance; permissions `chmod 400 your-key.pem`.
- **User:** For Ubuntu AMI it’s usually `ubuntu`; for Amazon Linux it’s often `ec2-user`.
- **Verbose:** If you paste the exact error, run:

```bash
ssh -v -i /path/to/your-key.pem ubuntu@<instance-public-ip-or-dns>
```

The last lines before timeout show whether it’s “connection timeout” (network/firewall) or “connection refused” (wrong host/port/SSH not listening).

---

## 8. Quick checklist summary

1. [ ] Get current IP: `curl -s ifconfig.me`
2. [ ] Add that IP as `x.x.x.x/32` to the **correct** security group (the one attached to the instance) for port 22.
3. [ ] Confirm instance is **Running** and use its **current** Public IPv4 or DNS in the SSH command.
4. [ ] Use the right key and user: `ssh -i key.pem ubuntu@<current-public-ip>`
5. [ ] If still timeout: try phone hotspot; check NACL; try `nc -vz <ip> 22` from same network.

---

## If you paste your error

Include:

- Exact SSH command you ran.
- Full timeout or error message (e.g. “Connection timed out” vs “Connection refused”).
- Output of `curl -s ifconfig.me` (your current IP).
- Instance state and **current** public IP from the EC2 console.

That will narrow down whether the issue is IP/SG, NACL, instance state, or network blocking.
