import "./Plans3.css";
export default function Plans3() {
  return (
    <div className="plans">
      <div className="heading">Available Plans</div>

      <div className="allThePlansContainer">
        <div className="plan">
          <div className="planContent">
            <div className="planHeader">Endowment </div>
            <div className="planText">
              <p>
                This plan combines life insurance with a savings component,
                providing a lump sum payout either upon the policyholder's death
                or at the end of the policy term, whichever comes first.
                <span className="showMore">
                  <a href="#">Show More</a>
                </span>
              </p>
            </div>
          </div>
          <div className="imageContainer">
            <div className="imageExtension">Most Selected</div>
            <div className="planImg" id="endowmentphoto"></div>
          </div>
        </div>
        <div className="plan">
          <div className="planContent">
            <div className="planHeader">Term Life</div>
            <div className="planText">
              <p>
                This plan provides pure life insurance coverage for a specified
                duration, offering a death benefit only if the insured person
                passes away during the term of the policy.
                <span className="showMore">
                  <a href="#">Show More</a>
                </span>
              </p>
            </div>
          </div>
          <div className="imageContainer">
            <div className="imageExtension">Cheapest</div>
            <div className="planImg" id="termlifephoto"></div>
          </div>
        </div>
        <div className="plan">
          <div className="planContent">
            <div className="planHeader">Money Back</div>
            <div className="planText">
              <p>
                This plan is a life insurance policy that returns a portion of
                the sum assured at regular intervals during the policy term,
                along with a lump sum payout at maturity or upon the
                policyholder's death.
                <span className="showMore">
                  <a href="#">Show More</a>
                </span>
              </p>
            </div>
          </div>

          <div className="imageContainer">
            <div className="imageExtension">Early payout</div>
            <div className="planImg" id="moneybackphoto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
