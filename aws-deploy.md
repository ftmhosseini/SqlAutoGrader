# AWS Deployment Guide — SQL Auto Grader

**Live URL:** https://sql.cirook.com  
**Stack:** React (craco build) → S3 + CloudFront subdomain of cirook.com  
**S3 bucket:** `sql-autograder-frontend`  
**Region:** us-east-1  
**Parent domain:** cirook.com (already managed in Route 53)

> Prerequisites: AWS CLI configured with `cirook` user (already done in cirook project).  
> If not set up yet, see `/Desktop/cirook/aws-deploy.md` Sections 1–3.

---

## 1. Build the App

```bash
cd /Users/fatemeh/Desktop/SQL-Auto-Grader/SqlAutoGrader
npm install
npm run build
```

Output goes to `build/` folder.

---

## 2. Create S3 Bucket (first time only)

```bash
aws s3 mb s3://sql-autograder-frontend --region us-east-1

aws s3 website s3://sql-autograder-frontend \
  --index-document index.html \
  --error-document index.html
```

### Make bucket public

```bash
aws s3api put-public-access-block \
  --bucket sql-autograder-frontend \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy \
  --bucket sql-autograder-frontend \
  --policy file://bucket-policy.json
```

### Upload files

```bash
aws s3 sync ./build s3://sql-autograder-frontend --delete
```

---

## 3. Create CloudFront Distribution (first time only)

1. Go to [console.aws.amazon.com/cloudfront](https://console.aws.amazon.com/cloudfront)
2. Click **Create distribution**
3. **Distribution name:** `sql-autograder`
4. **Domain (Route 53):** skip
5. **Origin type:** S3
6. **S3 origin:** select `sql-autograder-frontend`
7. **Origin path:** leave empty
8. When prompted: click **Use website endpoint**
9. **Settings:** both recommended options
10. **WAF:** skip
11. Click **Create distribution**
12. Settings → **Default root object:** `index.html` → Save

Save after creation:
- **Distribution ID:** *(copy from console)*
- **Distribution domain:** *(e.g. `yyyy.cloudfront.net`)*

---

## 4. Request ACM Certificate for sql.cirook.com (first time only)

> Must be in **us-east-1**.

```bash
aws acm request-certificate \
  --domain-name sql.cirook.com \
  --validation-method DNS \
  --region us-east-1
```

ACM gives you a CNAME validation record — add it to Route 53:

1. Go to **ACM → your certificate → Create records in Route 53** (one click)
2. Wait ~5 min for status: **Issued**

---

## 5. Attach Domain + Cert to CloudFront (first time only)

1. CloudFront → `sql-autograder` → **Settings → Edit**
2. **Alternate domain names:** add `sql.cirook.com`
3. **Custom SSL certificate:** select the ACM cert for `sql.cirook.com`
4. Save

---

## 6. Add DNS Record in Route 53 (first time only)

cirook.com is already in Route 53. Just add a CNAME for the subdomain.

Using the file `dns-change.json` (already in this project):
```json
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "sql.cirook.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "YOUR_CLOUDFRONT_DOMAIN"}]
    }
  }]
}
```

Update `dns-change.json` with your actual CloudFront domain, then run:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file:///Users/fatemeh/Desktop/SQL-Auto-Grader/SqlAutoGrader/dns-change.json
```

Get your zone ID:
```bash
aws route53 list-hosted-zones --query 'HostedZones[*].[Id,Name]' --output table
```

### Verify

```bash
dig @8.8.8.8 sql.cirook.com CNAME
```

Should return your CloudFront domain.

---

## 7. Re-deploy After Code Changes

```bash
cd /Users/fatemeh/Desktop/SQL-Auto-Grader/SqlAutoGrader
npm run build
aws s3 sync ./build s3://sql-autograder-frontend --delete

# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 8. Environment Variables (.env)

The app uses `.env` for Firebase and API keys. These are baked into the build at compile time — never commit `.env` to git.

Before building for production, make sure `.env` has the correct production values:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
```

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `sql.cirook.com` not resolving | Check CNAME record exists: `dig @8.8.8.8 sql.cirook.com CNAME` |
| Site loads but shows blank page | Check Default root object is `index.html` in CloudFront |
| Old version showing after deploy | Run CloudFront invalidation (Step 7) |
| ACM cert stuck on PENDING | Go to ACM → cert → Create records in Route 53 |
| `AccessDenied` on S3 | Re-run the `put-public-access-block` and `put-bucket-policy` commands |

---

## 10. Cost

- S3 + CloudFront — cents/month for low traffic
- ACM cert — free
- Route 53 CNAME record — included in existing hosted zone ($0.50/month already paid for cirook.com)
