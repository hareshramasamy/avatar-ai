import boto3
import os

def get_table():
    dynamodb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION", "us-east-2"))
    return dynamodb.Table("avatar-users")

def create_user(user_id: str, name: str, slug: str, email: str, password_hash: str, embed_token_hash: str, github_username: str):
    get_table().put_item(Item={
        "user_id": user_id,
        "name": name,
        "slug": slug,
        "email": email,
        "password_hash": password_hash,
        "embed_token_hash": embed_token_hash,
        "github_username": github_username,
    })

def get_user_by_email(email: str) -> dict | None:
    result = get_table().query(
        IndexName="email-index",
        KeyConditionExpression="email = :val",
        ExpressionAttributeValues={":val": email}
    )
    items = result.get("Items", [])
    return items[0] if items else None

def get_user_by_id(user_id: str) -> dict | None:
    result = get_table().get_item(Key={"user_id": user_id})
    return result.get("Item")

def get_user_by_embed_token(embed_token_hash: str) -> dict | None:
    result = get_table().query(
        IndexName="embed-token-index",
        KeyConditionExpression="embed_token_hash = :val",
        ExpressionAttributeValues={":val": embed_token_hash}
    )
    items = result.get("Items", [])
    return items[0] if items else None