# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - img "Fastenr" [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Welcome back
        - generic [ref=e10]: Sign in to your fastenr account
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Email
          - generic [ref=e15]:
            - img [ref=e16]
            - textbox "Email" [ref=e19]
        - generic [ref=e20]:
          - generic [ref=e21]: Password
          - generic [ref=e22]:
            - img [ref=e23]
            - textbox "Password" [ref=e26]
        - button "Sign In" [ref=e27] [cursor=pointer]
        - generic [ref=e28]:
          - generic [ref=e33]: Or continue with
          - generic [ref=e34]:
            - button "Google" [ref=e35] [cursor=pointer]:
              - img
              - text: Google
            - button "GitHub" [ref=e36] [cursor=pointer]:
              - img
              - text: GitHub
        - generic [ref=e37]:
          - text: Don't have an account?
          - link "Sign up" [ref=e38] [cursor=pointer]:
            - /url: /auth/signup
  - region "Notifications (F8)":
    - list
  - alert [ref=e39]
```